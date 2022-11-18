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
import { CommandRegistryImpl } from '../command-registry';
import { ReferenceMap } from '../../common/reference-map';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { InlineCompletionContext, InlineCompletionTriggerKind } from '../../common/plugin-api-rpc-model';
import { IdentifiableInlineCompletion, IdentifiableInlineCompletions, Position } from '../../common/plugin-api-rpc';

export class InlineCompletionAdapterBase {

    async provideInlineCompletions(
        _resource: URI,
        _position: Position,
        _context: InlineCompletionContext,
        _token: theia.CancellationToken
    ): Promise<IdentifiableInlineCompletions | undefined> {
        return undefined;
    }

    disposeCompletions(pid: number): void { }
}

export class InlineCompletionAdapter extends InlineCompletionAdapterBase {

    private readonly _references = new ReferenceMap<{
        dispose(): void;
        items: readonly theia.InlineCompletionItem[];
    }>();

    constructor(
        private readonly documents: DocumentsExtImpl,
        private readonly provider: theia.InlineCompletionItemProvider,
        private readonly commands: CommandRegistryImpl,
    ) {
        super();
    }

    private readonly languageTriggerKindToVSCodeTriggerKind: Record<InlineCompletionTriggerKind, theia.InlineCompletionTriggerKind> = {
        [InlineCompletionTriggerKind.Automatic]: theia.InlineCompletionTriggerKind.Automatic,
        [InlineCompletionTriggerKind.Explicit]: theia.InlineCompletionTriggerKind.Invoke,
    };

    override async provideInlineCompletions(
        resource: URI,
        position: Position,
        context: InlineCompletionContext,
        token: theia.CancellationToken
    ): Promise<IdentifiableInlineCompletions | undefined> {
        const doc = this.documents.getDocument(resource);
        const pos = Converter.toPosition(position);

        const result = await this.provider.provideInlineCompletionItems(doc, pos, {
            selectedCompletionInfo:
                context.selectedSuggestionInfo
                    ? {
                        range: Converter.toRange(context.selectedSuggestionInfo.range),
                        text: context.selectedSuggestionInfo.text
                    }
                    : undefined,
            triggerKind: this.languageTriggerKindToVSCodeTriggerKind[context.triggerKind]
        }, token);

        if (!result) {
            // undefined and null are valid results
            return undefined;
        }

        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }

        const normalizedResult = Array.isArray(result) ? result : result.items;
        const commands: theia.Command[] = []; // TODO: still proposed.

        let disposableCollection: DisposableCollection | undefined = undefined;
        const pid = this._references.createReferenceId({
            dispose(): void {
                disposableCollection?.dispose();
            },
            items: normalizedResult
        });

        return {
            pid,
            items: normalizedResult.map<IdentifiableInlineCompletion>((item, idx) => {
                // let command: theia.Command | undefined = undefined;
                if (item.command) {
                    if (!disposableCollection) {
                        disposableCollection = new DisposableCollection();
                    }
                    // command = this.commands.converter.toSafeCommand(item.command, disposableCollection);
                }

                const insertText = item.insertText;
                return ({
                    insertText: typeof insertText === 'string' ? insertText : { snippet: insertText.value },
                    filterText: item.filterText,
                    range: item.range ? Converter.fromRange(item.range) : undefined,
                    // command,
                    idx: idx,
                });
            }),
            commands: commands.map(c => {
                if (!disposableCollection) {
                    disposableCollection = new DisposableCollection();
                }
                return this.commands.converter.toSafeCommand(c, disposableCollection);
            })
        };
    }

    override disposeCompletions(pid: number): void {
        const data = this._references.disposeReferenceId(pid);
        data?.dispose();
    }

}
