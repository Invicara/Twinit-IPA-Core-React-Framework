
import EntityView from './entities/EntityView'
import DashboardView from './dashboards/DashboardView'
import UploadFilesWizard from './files/UploadFilesWizard'
import ScriptRunnerView from './solutionMgmt/ScriptRunnerView'
import DownloadsView from './DownloadsView'
import UserGroupView from './users/UserGroupView'
import DatasourcesView from './datasources/DatasourcesView'
import OMAPIView from './omapi/OMAPIView'

const InternalPages = {
    'entities/EntityView': EntityView,
    'dashboards/DashboardView': DashboardView,
    'files/UploadFilesWizard': UploadFilesWizard,
    'solutionMgmt/ScriptRunnerView': ScriptRunnerView,
    'DownloadsView': DownloadsView,
    'users/UserGroupView': UserGroupView,
    'datasources/DatasourcesView': DatasourcesView,
    'omapi/OMAPIView': OMAPIView
}

export default InternalPages