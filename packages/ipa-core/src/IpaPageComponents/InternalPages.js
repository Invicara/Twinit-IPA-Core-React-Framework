
import EntityView from './entities/EntityView'
import DashboardView from './dashboards/DashboardView'
import UploadFilesWizard from './files/UploadFilesWizard'
import ScriptRunnerView from './solutionMgmt/ScriptRunnerView'
import DownloadsView from './DownloadsView'
import UserGroupView from './users/UserGroupView'
import SisenseLoginPage from './sisense/SisenseLoginPage'
import SisenseLogoutPage from './sisense/SisenseLogoutPage'
import DatasourcesView from './datasources/DatasourcesView'

const InternalPages = {
    'entities/EntityView': EntityView,
    'dashboards/DashboardView': DashboardView,
    'files/UploadFilesWizard': UploadFilesWizard,
    'solutionMgmt/ScriptRunnerView': ScriptRunnerView,
    'DownloadsView': DownloadsView,
    'users/UserGroupView': UserGroupView,
    'SisenseLoginPage': SisenseLoginPage,
    'SisenseLogoutPage': SisenseLogoutPage,
    'datasources/DatasourcesView': DatasourcesView
}

export default InternalPages