
import EntityView from './entities/EntityView'
import DashboardView from './dashboards/DashboardView'
import UploadFilesWizard from './files/UploadFilesWizard'
import ScriptRunnerView from './solutionMgmt/ScriptRunnerView'
import DownloadsView from './DownloadsView'
import SisenseLoginPage from './sisense/SisenseLoginPage'
import SisenseLogoutPage from './sisense/SisenseLogoutPage'

const InternalPages = {
    'entities/EntityView': EntityView,
    'dashboards/DashboardView': DashboardView,
    'files/UploadFilesWizard': UploadFilesWizard,
    'solutionMgmt/ScriptRunnerView': ScriptRunnerView,
    'DownloadsView': DownloadsView,
    'SisenseLoginPage': SisenseLoginPage,
    'SisenseLogoutPage': SisenseLogoutPage
}

export default InternalPages