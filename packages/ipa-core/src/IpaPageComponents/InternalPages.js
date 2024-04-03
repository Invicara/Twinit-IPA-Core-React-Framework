
import EntityView from './entities/EntityView'
import DashboardView from './dashboards/DashboardView'
import UploadFilesWizard from './files/UploadFilesWizard'
import ScriptRunnerView from './solutionMgmt/ScriptRunnerView'
import DownloadsView from './DownloadsView'
import UserGroupView from './users/UserGroupView'
import DatasourcesView from './datasources/DatasourcesView'
import OMAPIView from './omapi/OMAPIView'
import EmptyComponent from "./mock/EmptyComponent";
import DocumentView from './files/DocumentView'

const InternalPages = {
    'entities/EntityView': EntityView,
    'files/DocumentView': DocumentView,
    'dashboards/DashboardView': DashboardView,
    'files/UploadFilesWizard': UploadFilesWizard,
    'solutionMgmt/ScriptRunnerView': ScriptRunnerView,
    'DownloadsView': DownloadsView,
    'users/UserGroupView': UserGroupView,
    'datasources/DatasourcesView': DatasourcesView,
    'omapi/OMAPIView': OMAPIView,
    'mock/EmptyComponent' : EmptyComponent
}

export default InternalPages