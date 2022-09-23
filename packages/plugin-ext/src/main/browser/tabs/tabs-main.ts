// *****************************************************************************
// Copyright (C) 2022 TypeFox and others.
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

import { DisposableCollection } from '@theia/core';
import { interfaces } from '@theia/core/shared/inversify';

import { TabsMain } from '../../../common/plugin-api-rpc';
import { RPCProtocol } from '../../../common/rpc-protocol';
import { ViewColumnService } from '../view-column-service';

export class TabsMainImp implements TabsMain {

////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EditorInputs sind in theia Widgets ??? in dieser Richtung forschen.
    // sowieso ist alles in theia ein widget, also gibt es nicht wirklich so etwas
    // wie EditorGroups. Einfach schritt für schritt versuchen zu verstehen was vscode
    // an den jeweiligen stellen in deren Main tut und dies dann auf theia übertragen.
    // Aber auf jeden fall in webview.ts beginnen, schauen was alles BaseWidget erweitert
    // und ob es zum beispiel entsprechende pendants bei den EditorInput varianten in VSCode gibt
////////////////////////////////////////////////////////////////////////////////////////////////////////
    // private readonly proxy: TabsExt;

    private readonly toDispose = new DisposableCollection();
    protected readonly viewColumnService: ViewColumnService;

    // // List of all groups and their corresponding tabs, this is **the** model
    // private tabGroupModel: TabGroupDto[] = [];
    // // Lookup table for finding group by id
    // private readonly groupLookup: Map<number, TabGroupDto> = new Map();
    // // Lookup table for finding tab by id
    // private readonly _tabInfoLookup: Map<string, TabInfo> = new Map();

    constructor(
        rpc: RPCProtocol,
        container: interfaces.Container
    ) {

        // this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.TABS_EXT);

        // // Main listener which responds to events from the editor service
        this.viewColumnService = container.get(ViewColumnService);
        this.toDispose.push(this.viewColumnService.onViewColumnChanged(event => this.updateTabsModel(event)));

        // // Structural group changes (add, remove, move, etc) are difficult to patch.
        // // Since they happen infrequently we just rebuild the entire model
        // this.disposables.push(this._editorGroupsService.onDidAddGroup(() => this.createTabsModel()));
        // this.disposables.push(this._editorGroupsService.onDidRemoveGroup(() => this.createTabsModel()));

        // // Once everything is read go ahead and initialize the model
        // this._editorGroupsService.whenReady.then(() => this.createTabsModel());
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    // dispose(): void {
    //     this.groupLookup.clear();
    //     this._tabInfoLookup.clear();
    //     this.disposables.dispose();
    // }

    // /**
    //  * Creates a tab object with the correct properties
    //  * @param editor The editor input represented by the tab
    //  * @param group The group the tab is in
    //  * @returns A tab object
    //  */
    // private _buildTabObject(group: IEditorGroup, editor: EditorInput, editorIndex: number): TabDto {
    //     const editorId = editor.editorId;
    //     const tab: TabDto = {
    //         id: this._generateTabId(editor, group.id),
    //         label: editor.getName(),
    //         editorId,
    //         input: this.editorInputToDto(editor),
    //         isPinned: group.isSticky(editorIndex),
    //         isPreview: !group.isPinned(editorIndex),
    //         isActive: group.isActive(editor),
    //         isDirty: editor.isDirty()
    //     };
    //     return tab;
    // }

    // private editorInputToDto(editor: EditorInput): AnyInputDto {

    //     if (editor instanceof MergeEditorInput) {
    //         return {
    //             kind: TabInputKind.TextMergeInput,
    //             base: editor.base,
    //             input1: editor.input1.uri,
    //             input2: editor.input2.uri,
    //             result: editor.resource
    //         };
    //     }

    //     if (editor instanceof AbstractTextResourceEditorInput) {
    //         return {
    //             kind: TabInputKind.TextInput,
    //             uri: editor.resource
    //         };
    //     }

    //     if (editor instanceof SideBySideEditorInput && !(editor instanceof DiffEditorInput)) {
    //         const primaryResource = editor.primary.resource;
    //         const secondaryResource = editor.secondary.resource;
    //         // If side by side editor with same resource on both sides treat it as a singular tab kind
    //         if (editor.primary instanceof AbstractTextResourceEditorInput
    //             && editor.secondary instanceof AbstractTextResourceEditorInput
    //             && isEqual(primaryResource, secondaryResource)
    //             && primaryResource
    //             && secondaryResource
    //         ) {
    //             return {
    //                 kind: TabInputKind.TextInput,
    //                 uri: primaryResource
    //             };
    //         }
    //         return { kind: TabInputKind.UnknownInput };
    //     }

    //     if (editor instanceof NotebookEditorInput) {
    //         return {
    //             kind: TabInputKind.NotebookInput,
    //             notebookType: editor.viewType,
    //             uri: editor.resource
    //         };
    //     }

    //     if (editor instanceof CustomEditorInput) {
    //         return {
    //             kind: TabInputKind.CustomEditorInput,
    //             viewType: editor.viewType,
    //             uri: editor.resource,
    //         };
    //     }

    //     if (editor instanceof WebviewInput) {
    //         return {
    //             kind: TabInputKind.WebviewEditorInput,
    //             viewType: editor.viewType
    //         };
    //     }

    //     if (editor instanceof TerminalEditorInput) {
    //         return {
    //             kind: TabInputKind.TerminalEditorInput
    //         };
    //     }

    //     if (editor instanceof DiffEditorInput) {
    //         if (editor.modified instanceof AbstractTextResourceEditorInput && editor.original instanceof AbstractTextResourceEditorInput) {
    //             return {
    //                 kind: TabInputKind.TextDiffInput,
    //                 modified: editor.modified.resource,
    //                 original: editor.original.resource
    //             };
    //         }
    //         if (editor.modified instanceof NotebookEditorInput && editor.original instanceof NotebookEditorInput) {
    //             return {
    //                 kind: TabInputKind.NotebookDiffInput,
    //                 notebookType: editor.original.viewType,
    //                 modified: editor.modified.resource,
    //                 original: editor.original.resource
    //             };
    //         }
    //     }

    //     if (editor instanceof InteractiveEditorInput) {
    //         return {
    //             kind: TabInputKind.InteractiveEditorInput,
    //             uri: editor.resource,
    //             inputBoxUri: editor.inputResource
    //         };
    //     }

    //     return { kind: TabInputKind.UnknownInput };
    // }

    // /**
    //  * Generates a unique id for a tab
    //  * @param editor The editor input
    //  * @param groupId The group id
    //  * @returns A unique identifier for a specific tab
    //  */
    // private _generateTabId(editor: EditorInput, groupId: number): string {
    //     let resourceString: string | undefined;
    //     // Properly get the resource and account for side by side editors
    //     const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH });
    //     if (resource instanceof URI) {
    //         resourceString = resource.toString();
    //     } else {
    //         resourceString = `${resource?.primary?.toString()}-${resource?.secondary?.toString()}`;
    //     }
    //     return `${groupId}~${editor.editorId}-${editor.typeId}-${resourceString} `;
    // }

    // /**
    //  * Called whenever a group activates, updates the model by marking the group as active an notifies the extension host
    //  */
    // private _onDidGroupActivate() {
    //     const activeGroupId = this._editorGroupsService.activeGroup.id;
    //     const activeGroup = this.groupLookup.get(activeGroupId);
    //     if (activeGroup) {
    //         // Ok not to loop as exthost accepts last active group
    //         activeGroup.isActive = true;
    //         this.proxy.$acceptTabGroupUpdate(activeGroup);
    //     }
    // }

    // /**
    //  * Called when the tab label changes
    //  * @param groupId The id of the group the tab exists in
    //  * @param editorInput The editor input represented by the tab
    //  */
    // private _onDidTabLabelChange(groupId: number, editorInput: EditorInput, editorIndex: number) {
    //     const tabId = this._generateTabId(editorInput, groupId);
    //     const tabInfo = this._tabInfoLookup.get(tabId);
    //     // If tab is found patch, else rebuild
    //     if (tabInfo) {
    //         tabInfo.tab.label = editorInput.getName();
    //         this.proxy.$acceptTabOperation({
    //             groupId,
    //             index: editorIndex,
    //             tabDto: tabInfo.tab,
    //             kind: TabModelOperationKind.TAB_UPDATE
    //         });
    //     } else {
    //         console.error('Invalid model for label change, rebuilding');
    //         this.createTabsModel();
    //     }
    // }

    // /**
    //  * Called when a new tab is opened
    //  * @param groupId The id of the group the tab is being created in
    //  * @param editorInput The editor input being opened
    //  * @param editorIndex The index of the editor within that group
    //  */
    // private _onDidTabOpen(groupId: number, editorInput: EditorInput, editorIndex: number) {
    //     const group = this._editorGroupsService.getGroup(groupId);
    //     // Even if the editor service knows about the group the group might not exist yet in our model
    //     const groupInModel = this.groupLookup.get(groupId) !== undefined;
    //     // Means a new group was likely created so we rebuild the model
    //     if (!group || !groupInModel) {
    //         this.createTabsModel();
    //         return;
    //     }
    //     const tabs = this.groupLookup.get(groupId)?.tabs;
    //     if (!tabs) {
    //         return;
    //     }
    //     // Splice tab into group at index editorIndex
    //     const tabObject = this._buildTabObject(group, editorInput, editorIndex);
    //     tabs.splice(editorIndex, 0, tabObject);
    //     // Update lookup
    //     this._tabInfoLookup.set(this._generateTabId(editorInput, groupId), { group, editorInput, tab: tabObject });

    //     this.proxy.$acceptTabOperation({
    //         groupId,
    //         index: editorIndex,
    //         tabDto: tabObject,
    //         kind: TabModelOperationKind.TAB_OPEN
    //     });
    // }

    // /**
    //  * Called when a tab is closed
    //  * @param groupId The id of the group the tab is being removed from
    //  * @param editorIndex The index of the editor within that group
    //  */
    // private _onDidTabClose(groupId: number, editorIndex: number) {
    //     const group = this._editorGroupsService.getGroup(groupId);
    //     const tabs = this.groupLookup.get(groupId)?.tabs;
    //     // Something is wrong with the model state so we rebuild
    //     if (!group || !tabs) {
    //         this.createTabsModel();
    //         return;
    //     }
    //     // Splice tab into group at index editorIndex
    //     const removedTab = tabs.splice(editorIndex, 1);

    //     // Index must no longer be valid so we return prematurely
    //     if (removedTab.length === 0) {
    //         return;
    //     }

    //     // Update lookup
    //     this._tabInfoLookup.delete(removedTab[0]?.id ?? '');

    //     this.proxy.$acceptTabOperation({
    //         groupId,
    //         index: editorIndex,
    //         tabDto: removedTab[0],
    //         kind: TabModelOperationKind.TAB_CLOSE
    //     });
    // }

    // /**
    //  * Called when the active tab changes
    //  * @param groupId The id of the group the tab is contained in
    //  * @param editorIndex The index of the tab
    //  */
    // private _onDidTabActiveChange(groupId: number, editorIndex: number) {
    //     // TODO @lramos15 use the tab lookup here if possible. Do we have an editor input?!
    //     const tabs = this.groupLookup.get(groupId)?.tabs;
    //     if (!tabs) {
    //         return;
    //     }
    //     const activeTab = tabs[editorIndex];
    //     // No need to loop over as the exthost uses the most recently marked active tab
    //     activeTab.isActive = true;
    //     // Send DTO update to the exthost
    //     this.proxy.$acceptTabOperation({
    //         groupId,
    //         index: editorIndex,
    //         tabDto: activeTab,
    //         kind: TabModelOperationKind.TAB_UPDATE
    //     });

    // }

    // /**
    //  * Called when the dirty indicator on the tab changes
    //  * @param groupId The id of the group the tab is in
    //  * @param editorIndex The index of the tab
    //  * @param editor The editor input represented by the tab
    //  */
    // private _onDidTabDirty(groupId: number, editorIndex: number, editor: EditorInput) {
    //     const tabId = this._generateTabId(editor, groupId);
    //     const tabInfo = this._tabInfoLookup.get(tabId);
    //     // Something wrong with the model state so we rebuild
    //     if (!tabInfo) {
    //         console.error('Invalid model for dirty change, rebuilding');
    //         this.createTabsModel();
    //         return;
    //     }
    //     tabInfo.tab.isDirty = editor.isDirty();
    //     this.proxy.$acceptTabOperation({
    //         groupId,
    //         index: editorIndex,
    //         tabDto: tabInfo.tab,
    //         kind: TabModelOperationKind.TAB_UPDATE
    //     });
    // }

    // /**
    //  * Called when the tab is pinned/unpinned
    //  * @param groupId The id of the group the tab is in
    //  * @param editorIndex The index of the tab
    //  * @param editor The editor input represented by the tab
    //  */
    // private _onDidTabPinChange(groupId: number, editorIndex: number, editor: EditorInput) {
    //     const tabId = this._generateTabId(editor, groupId);
    //     const tabInfo = this._tabInfoLookup.get(tabId);
    //     const group = tabInfo?.group;
    //     const tab = tabInfo?.tab;
    //     // Something wrong with the model state so we rebuild
    //     if (!group || !tab) {
    //         console.error('Invalid model for sticky change, rebuilding');
    //         this.createTabsModel();
    //         return;
    //     }
    //     // Whether or not the tab has the pin icon (internally it's called sticky)
    //     tab.isPinned = group.isSticky(editorIndex);
    //     this.proxy.$acceptTabOperation({
    //         groupId,
    //         index: editorIndex,
    //         tabDto: tab,
    //         kind: TabModelOperationKind.TAB_UPDATE
    //     });
    // }

    // /**
    //  * Called when the tab is preview / unpreviewed
    //  * @param groupId The id of the group the tab is in
    //  * @param editorIndex The index of the tab
    //  * @param editor The editor input represented by the tab
    //  */
    // private _onDidTabPreviewChange(groupId: number, editorIndex: number, editor: EditorInput) {
    //     const tabId = this._generateTabId(editor, groupId);
    //     const tabInfo = this._tabInfoLookup.get(tabId);
    //     const group = tabInfo?.group;
    //     const tab = tabInfo?.tab;
    //     // Something wrong with the model state so we rebuild
    //     if (!group || !tab) {
    //         console.error('Invalid model for sticky change, rebuilding');
    //         this.createTabsModel();
    //         return;
    //     }
    //     // Whether or not the tab has the pin icon (internally it's called pinned)
    //     tab.isPreview = !group.isPinned(editorIndex);
    //     this.proxy.$acceptTabOperation({
    //         kind: TabModelOperationKind.TAB_UPDATE,
    //         groupId,
    //         tabDto: tab,
    //         index: editorIndex
    //     });
    // }

    // private _onDidTabMove(groupId: number, editorIndex: number, oldEditorIndex: number, editor: EditorInput) {
    //     const tabs = this.groupLookup.get(groupId)?.tabs;
    //     // Something wrong with the model state so we rebuild
    //     if (!tabs) {
    //         console.error('Invalid model for move change, rebuilding');
    //         this.createTabsModel();
    //         return;
    //     }

    //     // Move tab from old index to new index
    //     const removedTab = tabs.splice(oldEditorIndex, 1);
    //     if (removedTab.length === 0) {
    //         return;
    //     }
    //     tabs.splice(editorIndex, 0, removedTab[0]);

    //     // Notify exthost of move
    //     this.proxy.$acceptTabOperation({
    //         kind: TabModelOperationKind.TAB_MOVE,
    //         groupId,
    //         tabDto: removedTab[0],
    //         index: editorIndex,
    //         oldIndex: oldEditorIndex
    //     });
    // }

    // /**
    //  * Builds the model from scratch based on the current state of the editor service.
    //  */
    // private createTabsModel(): void {
    //     this.tabGroupModel = [];
    //     this.groupLookup.clear();
    //     this._tabInfoLookup.clear();
    //     let tabs: TabDto[] = [];
    //     for (const group of this._editorGroupsService.groups) {
    //         const currentTabGroupModel: IEditorTabGroupDto = {
    //             groupId: group.id,
    //             isActive: group.id === this._editorGroupsService.activeGroup.id,
    //             viewColumn: editorGroupToColumn(this._editorGroupsService, group),
    //             tabs: []
    //         };
    //         group.editors.forEach((editor, editorIndex) => {
    //             const tab = this._buildTabObject(group, editor, editorIndex);
    //             tabs.push(tab);
    //             // Add information about the tab to the lookup
    //             this._tabInfoLookup.set(this._generateTabId(editor, group.id), {
    //                 group,
    //                 tab,
    //                 editorInput: editor
    //             });
    //         });
    //         currentTabGroupModel.tabs = tabs;
    //         this.tabGroupModel.push(currentTabGroupModel);
    //         this.groupLookup.set(group.id, currentTabGroupModel);
    //         tabs = [];
    //     }
    //     // notify the ext host of the new model
    //     this.proxy.$acceptEditorTabModel(this.tabGroupModel);
    // }

    /**
     * The main handler for the tab events
     * @param events The list of events to process
     */
    private updateTabsModel(changeEvent: {
        id: string, viewColumn: number
    }): void {
        const id = changeEvent.id;
        const groupId = changeEvent.viewColumn;
        console.log('YEAH', id, groupId);

        // switch (event.kind) {
        //     case GroupModelChangeKind.GROUP_ACTIVE:
        //         if (groupId === this._editorGroupsService.activeGroup.id) {
        //             this._onDidGroupActivate();
        //             break;
        //         } else {
        //             return;
        //         }
        //     case GroupModelChangeKind.EDITOR_LABEL:
        //         if (event.editor !== undefined && event.editorIndex !== undefined) {
        //             this._onDidTabLabelChange(groupId, event.editor, event.editorIndex);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_OPEN:
        //         if (event.editor !== undefined && event.editorIndex !== undefined) {
        //             this._onDidTabOpen(groupId, event.editor, event.editorIndex);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_CLOSE:
        //         if (event.editorIndex !== undefined) {
        //             this._onDidTabClose(groupId, event.editorIndex);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_ACTIVE:
        //         if (event.editorIndex !== undefined) {
        //             this._onDidTabActiveChange(groupId, event.editorIndex);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_DIRTY:
        //         if (event.editorIndex !== undefined && event.editor !== undefined) {
        //             this._onDidTabDirty(groupId, event.editorIndex, event.editor);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_STICKY:
        //         if (event.editorIndex !== undefined && event.editor !== undefined) {
        //             this._onDidTabPinChange(groupId, event.editorIndex, event.editor);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_PIN:
        //         if (event.editorIndex !== undefined && event.editor !== undefined) {
        //             this._onDidTabPreviewChange(groupId, event.editorIndex, event.editor);
        //             break;
        //         }
        //     case GroupModelChangeKind.EDITOR_MOVE:
        //         if (isGroupEditorMoveEvent(event) && event.editor && event.editorIndex !== undefined && event.oldEditorIndex !== undefined) {
        //             this._onDidTabMove(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
        //             break;
        //         }
        //     default:
        //         // If it's not an optimized case we rebuild the tabs model from scratch
        //         this.createTabsModel();
        // }
    }

    // #region Messages received from Ext Host
    $moveTab(tabId: string, index: number, viewColumn: number, preserveFocus?: boolean): void {
        // const groupId = columnToEditorGroup(this._editorGroupsService, this._configurationService, viewColumn);
        // const tabInfo = this._tabInfoLookup.get(tabId);
        // const tab = tabInfo?.tab;
        // if (!tab) {
        //     throw new Error(`Attempted to close tab with id ${tabId} which does not exist`);
        // }
        // let targetGroup: IEditorGroup | undefined;
        // const sourceGroup = this._editorGroupsService.getGroup(tabInfo.group.id);
        // if (!sourceGroup) {
        //     return;
        // }
        // // If group index is out of bounds then we make a new one that's to the right of the last group
        // if (this.groupLookup.get(groupId) === undefined) {
        //     let direction = GroupDirection.RIGHT;
        //     // Make sure we respect the user's preferred side direction
        //     if (viewColumn === SIDE_GROUP) {
        //         direction = preferredSideBySideGroupDirection(this._configurationService);
        //     }
        //     targetGroup = this._editorGroupsService.addGroup(this._editorGroupsService.groups[this._editorGroupsService.groups.length - 1], direction, undefined);
        // } else {
        //     targetGroup = this._editorGroupsService.getGroup(groupId);
        // }
        // if (!targetGroup) {
        //     return;
        // }

        // // Similar logic to if index is out of bounds we place it at the end
        // if (index < 0 || index > targetGroup.editors.length) {
        //     index = targetGroup.editors.length;
        // }
        // // Find the correct EditorInput using the tab info
        // const editorInput = tabInfo?.editorInput;
        // if (!editorInput) {
        //     return;
        // }
        // // Move the editor to the target group
        // sourceGroup.moveEditor(editorInput, targetGroup, { index, preserveFocus });
        return;
    }

    async $closeTab(tabIds: string[], preserveFocus?: boolean): Promise<boolean> {
        console.log('CLOSE TAB IN MAIN CALLED');
        // const groups: Map<IEditorGroup, EditorInput[]> = new Map();
        // for (const tabId of tabIds) {
        //     const tabInfo = this._tabInfoLookup.get(tabId);
        //     const tab = tabInfo?.tab;
        //     const group = tabInfo?.group;
        //     const editorTab = tabInfo?.editorInput;
        //     // If not found skip
        //     if (!group || !tab || !tabInfo || !editorTab) {
        //         continue;
        //     }
        //     const groupEditors = groups.get(group);
        //     if (!groupEditors) {
        //         groups.set(group, [editorTab]);
        //     } else {
        //         groupEditors.push(editorTab);
        //     }
        // }
        // // Loop over keys of the groups map and call closeEditors
        // const results: boolean[] = [];
        // for (const [group, editors] of groups) {
        //     results.push(await group.closeEditors(editors, { preserveFocus }));
        // }
        // // TODO @jrieken This isn't quite right how can we say true for some but not others?
        // return results.every(result => result);
        return true;
    }

    async $closeGroup(groupIds: number[], preserveFocus?: boolean): Promise<boolean> {
        // const groupCloseResults: boolean[] = [];
        // for (const groupId of groupIds) {
        //     const group = this._editorGroupsService.getGroup(groupId);
        //     if (group) {
        //         groupCloseResults.push(await group.closeAllEditors());
        //         // Make sure group is empty but still there before removing it
        //         if (group.count === 0 && this._editorGroupsService.getGroup(group.id)) {
        //             this._editorGroupsService.removeGroup(group);
        //         }
        //     }
        // }
        // return groupCloseResults.every(result => result);
        return false;
    }
    // #endregion
}
