import withGenericPage  from "./GenericPage"
import {withAppContext} from '../AppProvider'

const asIpaPage = (page) => withAppContext(withGenericPage(page))

export default asIpaPage