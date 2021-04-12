import {TextSearch} from "./TextSearch";
import {TreeSearch} from "./TreeSearch";
import {AdvancedSearch} from "./AdvancedSearch";
import {ScriptedSelects} from "./EnhancedScriptedSelects";
import {ScriptedLinkedSelects} from "./EnhancedScriptedLinkedSelects";
import {CreatableScriptedSelects} from "./CreatableScriptedSelects";

const controlsMap = {
    '<<TEXT_SEARCH>>': TextSearch,
    '<<TREE_SEARCH>>': TreeSearch,
    '<<ADVANCED_SEARCH>>': AdvancedSearch,
    '<<SCRIPTED_SELECTS>>': ScriptedSelects,
    '<<SCRIPTED_LINKED_SELECTS>>': ScriptedLinkedSelects,
    '<<CREATABLE_SCRIPTED_SELECTS>>': CreatableScriptedSelects,
    '<<HIERARCHY>>': () => <div style={{margin: 10}}>Deprecated hierarchy control. Please use Scripted Linked Selects
        instead</div>, //TODO Remove when fully deprecated
};

export const ControlProvider = {
    getControlComponent: ({query}) => controlsMap[query]
}