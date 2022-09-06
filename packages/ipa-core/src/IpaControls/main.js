import SimpleTable from './SimpleTable'
import SimpleTabbedTable from './SimpleTabbedTable'
import GenericMatButton from './GenericMatButton'
import EnhancedFetchControl from './EnhancedFetchControl'
import {StackableDrawer} from '../IpaDialogs/StackableDrawer'
import FancyTreeControl from './FancyTreeControl'
import ChartStack from './ChartStack'
import CrossEntitySearch from './CrossEntitySearch'
import {CreatableScriptedSelects} from './CreatableScriptedSelects'
import GenericIframe from './GenericIframe'
import MiniButton, {MiniIconButton} from './MiniButton'
import {AdvancedSearch} from "./AdvancedSearch";
import BigButtonBar from "./BigButtonBar";
import CompactButtonBar from "./CompactButtonBar";
import {defaultTheme, DynamicAttributeInput} from "./DynamicAttributeInput";
import {EnhancedPickListSelect} from "./EnhancedPickListSelect";
import {ScriptedLinkedSelects} from "./EnhancedScriptedLinkedSelects";
import {ScriptedLinkedSelects as ScriptedLinkedSelectsOld} from "./ScriptedLinkedSelects";
import {ScriptedSelects} from "./EnhancedScriptedSelects";
import Image from "./Image";
import {FetchButton} from "./FetchButton";
import {FetchingLegend} from "./FetchingLegend";
import FilterControl from "./FilterControl";
import GenericButton from "./GenericButton";
import GroupAndFilterControl from "./GroupAndFilterControl";
import GroupControl from "./GroupControl";
import HierarchyAttributeSelects from "./HierarchyAttributeSelects";
import Item from "./Item";
import LinkedIcon from "./LinkedIcon";
import LinkedSelectsProgressive from "./LinkedSelectsProgressive";
import {OrDivider} from "./OrDivider";
import ReactiveTreeControl from "./ReactiveTreeControl";
import ScriptedChart from "./ScriptedChart";
import SimpleMultiSelect from "./SimpleMultiSelect";
import SimpleSelect from "./SimpleSelect";
import SimpleTextThrobber from "./SimpleTextThrobber";
import SimpleTextReducer from './SimpleTextReducer';
import {TextSearch} from "./TextSearch";
import TreeControl from "./TreeControl";
import {TreeSearch} from "./TreeSearch";
import {ControlProvider} from "./ControlProvider";
import {Overlay} from "./Overlay";
import SplitButton from "./SplitButton";
import {PinkCheckbox, RoundCheckbox, SquareInSquareCheckbox, TickCheckbox, useChecked} from "./Checkboxes";
import RadioButtons from './RadioButtons'

const IpaControls = {
    AdvancedSearch,
    BigButtonBar,
    ChartStack,
    RoundCheckbox,
    SquareInSquareCheckbox,
    PinkCheckbox,
    TickCheckbox,
    useChecked,
    RadioButtons,
    CompactButtonBar,
    ControlProvider,
    CreatableScriptedSelects,
    CrossEntitySearch,
    DynamicAttributeInput,
    EnhancedFetchControl,
    EnhancedPickListSelect,
    ScriptedLinkedSelects,
    ScriptedLinkedSelectsOld,
    ScriptedSelects,
    FancyTreeControl,
    FetchButton,
    FetchingLegend,
    FilterControl,
    GenericButton,
    Iframe: GenericIframe,
    GenericIframe,
    IpaButton: GenericMatButton,
    GenericMatButton,
    GroupAndFilterControl,
    GroupControl,
    HierarchyAttributeSelects,
    Image,
    Item,
    LinkedIcon,
    LinkedSelectsProgressive,
    MiniButton,
    IpaMiniButton: MiniButton,
    MiniIconButton,
    IpaMiniIconButton: MiniIconButton,
    OrDivider,
    Overlay,
    ReactiveTreeControl,
    ScriptedChart,
    SimpleMultiSelect,
    SimpleTextReducer,
    SimpleSelect,
    SimpleTable,
    SimpleTabbedTable,
    SimpleTextThrobber,
    SplitButton,
    StackableDrawer,
    TextSearch,
    TreeControl,
    TreeSearch,
    defaultTheme, //TODO This is a theme, not a control. I left it here bc it's just one, but if there were to be more, we should consider creating an IpaThemes module
}

export default IpaControls