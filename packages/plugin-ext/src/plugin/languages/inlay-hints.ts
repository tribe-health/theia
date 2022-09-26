// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import * as theia from '@theia/plugin';
import * as Converter from '../type-converters';
import { DocumentsExtImpl } from '../documents';
import { URI } from '@theia/core/shared/vscode-uri';
import { Range } from '../../common/plugin-api-rpc-model';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { InlayHintDto, InlayHintsDto } from '../../common';

export class InlayHintsAdapter {

    private readonly cache = new Map<number, theia.InlayHint>();
    private readonly disposables = new Map<number, DisposableCollection>();

    private cacheId = 0;

    constructor(
        private documents: DocumentsExtImpl,
        private provider: theia.InlayHintsProvider
    ) { }

    async provideInlayHints(resource: URI, range: Range, token: theia.CancellationToken): Promise<InlayHintsDto | undefined> { // TODO: FIX RETURN TYPE.
        const documentData = this.documents.getDocumentData(resource);
        if (!documentData) {
            return Promise.reject(new Error(`There are no document for ${resource}`));
        }

        const doc = documentData.document;
        const ran = <theia.Range>Converter.toRange(range);
        const hints = await this.provider.provideInlayHints(doc, ran, token);

        if (!Array.isArray(hints) || hints.length === 0) {
            return undefined;
        }

        if (token.isCancellationRequested) {
            return undefined;
        }

        const result: InlayHintsDto = { hints: [], cacheId: 0 }; // TODO: FIX CACHE ID.
        for (const hint of hints) {
            if (!hint) {
                continue;
            }

            const nextCacheId = this.nextCacheId();
            const toDispose = new DisposableCollection();
            this.cache.set(nextCacheId, hint);
            this.disposables.set(nextCacheId, toDispose);

            if (this.isValidInlayHint(hint, ran)) {
                result.hints.push(this.convertInlayHint(hint, nextCacheId));
            }
        }

        return result;
    }

    async resolveInlayHints(id: number, token: theia.CancellationToken): Promise<InlayHintDto | undefined> {
        if (typeof this.provider.resolveInlayHint !== 'function') {
            return undefined;
        }
        const item = this.cache.get(id);
        if (!item) {
            return undefined;
        }
        const hint = await this.provider.resolveInlayHint!(item, token);
        if (!hint) {
            return undefined;
        }
        if (!this.isValidInlayHint(hint)) {
            return undefined;
        }
        return this.convertInlayHint(hint, id);
    }

    private isValidInlayHint(hint: theia.InlayHint, range?: theia.Range): boolean {
        if (hint.label.length === 0 || Array.isArray(hint.label) && hint.label.every(part => part.value.length === 0)) {
            return false;
        }
        if (range && !range.contains(hint.position)) {
            return false;
        }
        return true;
    }

    private convertInlayHint(hint: theia.InlayHint, id: number): InlayHintDto {

        const disposables = this.disposables.get(id);
        if (!disposables) {
            throw Error('DisposableStore is missing...');
        }

        const result: InlayHintDto = {
            label: '', // fill-in below
            cacheId: id,
            tooltip: hint.tooltip,
            position: Converter.fromPosition(hint.position),
            textEdits: hint.textEdits && hint.textEdits.map(Converter.fromTextEdit),
            kind: hint.kind && Converter.InlayHintKind.from(hint.kind),
            paddingLeft: hint.paddingLeft,
            paddingRight: hint.paddingRight,
        };

        // TODO: FIX LABEL HANDLING.
        return result;
    }

    private nextCacheId(): number {
        return this.cacheId++;
    }

    releaseHints(id: number): void {
        this.disposables.get(id)?.dispose();
        this.disposables.delete(id);
        this.cache.delete(id);
    }

}
