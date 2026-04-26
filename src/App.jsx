import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AgreementProvider } from './context/AgreementContext';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// ADMIN
import Menu from '../src/pages/admin/Menu';
import AgreementManagement from '../src/pages/admin/AgreementManagement';
import PayerManagement from '../src/pages/admin/PayerManagement';
import UserManagement from '../src/pages/admin/UserManagement';
import ParamsManagement from './pages/admin/ParamsManagement';
import PayerManagementAdmin from './pages/admin/PayerManagementAdmin';
import UserManagement2 from '../src/pages/admin/UserManagement2';
import UploadFilePageAdmin from './pages/admin/UploadFilePageAdmin';
import UploadFilePage from './pages/admin/UploadFilePage';
import EntityManagement from './pages/admin/EntityManagement';
import ViewDocument from './pages/admin/ViewDocument';

// PAYER
import ApproveDocuments from '../src/pages/payer/ApproveDocumentsV2';
import ApproveDocumentsTwoModeAuth from './pages/payer/ApproveDocumentsTwoModeAuth';
import SelectDocumentsTwoModeAuth from './pages/supplier/SelectDocumentsTwoModeAuth';

// SUPPLIER
import SelectDocuments from '../src/pages/supplier/SelectDocuments';
import DocumentLog from './pages/supplier/DocumentLog';

// SHARED
import ResourceNotFound from '../src/pages/shared-pages/ResourceNotFound';
import Unauthorized from '../src/pages/shared-pages/Unauthorized';
import SelectAgreementToStart from '../src/pages/shared-pages/SelectAgreementToStart';

// PUBLIC
import Login from '../src/pages/auth/Login';
import Layout from '../src/components/layouts/MainLayout';
import DocumentManagement from './pages/admin/DocumentManagement';
//import UploadFilePageAuthTwo from './pages/admin/UploadFilePageAuthTwo';

const ProtectedRoute = ({ allowedRoles, requiredPermissions = [] }) => {
  
  const { user, isLoading } = useAuth();

  if ( !user && !isLoading ) {
    //window.location.replace("http://sv4106lap.daviviendasv.com/app/sso.nsf/");
  }
    
  const hasRole = allowedRoles.includes(user.role);
  const hasPermissions = requiredPermissions.every(p => user.permissions.includes(p));

  if (!hasRole || !hasPermissions) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;

};

const DynamicRedirect = () => {

  const { user, isLoading } = useAuth();

  // if( !user && !isLoading ) return <Navigate to="/login" replace />; 
  if ( !user ) {
    //window.location.replace("http://sv4106lap.daviviendasv.com/app/sso.nsf/");
  }

  switch (user.role) {
    case ROLES.MANAGER:
      return <Navigate to="/admin" replace />;
    case ROLES.SUPPLIER:
      return <Navigate to="/select-agreement" replace />;
    case ROLES.AUTHORIZING:
      return <Navigate to="/payer" replace />;
    case ROLES.SUPPLIER_TWO_MODE_AUTH:
      return <Navigate to="/select-agreement-two" replace />;
    case ROLES.AUTHORIZING_TWO_MODE_AUTH:
      return <Navigate to="/payer-two" replace />;
    case ROLES.OPERATOR:
      return <Navigate to="/upload-file" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

const AppContent = () => {
  
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (<>
    <Routes>
      <Route path="/" element={<DynamicRedirect />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<ResourceNotFound />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
        <Route path="admin" element={<Layout />}>
          <Route index element={<Menu />} />
          <Route path="agreement-management" element={<AgreementManagement />} />
          <Route path="supplier-management" element={<EntityManagement />} />
          <Route path="payer-management-admin" element={<PayerManagementAdmin />} />
          <Route path="user-management" element={<UserManagement2 />} />
          <Route path="params-management" element={<ParamsManagement />} />
          <Route path="upload-file-admin" element={<UploadFilePageAdmin/>} />
          <Route path="documents-history" element={<DocumentManagement />} />
          <Route path="view-documents/:id" element={<ViewDocument />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPPLIER]} />}>
        <Route path='select-agreement' element={<SelectAgreementToStart />}></Route>
        <Route path="supplier" element={<Layout />}>
          <Route index element={<SelectDocuments />} />
          <Route path="documents-history" element={<DocumentLog />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.AUTHORIZING]} requiredPermissions={[]} />}>
        <Route path="payer" element={<Layout />}>
          <Route index element={<UploadFilePage />} />
        </Route>
      </Route>

      {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.OPERATOR]} requiredPermissions={[]} />}>
        <Route path="upload-file" element={<Layout />}>
          <Route index element={<UploadFilePage />} />
        </Route>
      </Route> */}

      {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.AUTHORIZING_TWO_MODE_AUTH]} requiredPermissions={[]} />}>
        <Route path="payer-two" element={<Layout />}>
          <Route index element={<UploadFilePageAuthTwo />} />
          <Route path="approve-documents-two" element={<ApproveDocumentsTwoModeAuth />} />
        </Route>
      </Route> */}

      {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPPLIER_TWO_MODE_AUTH]} requiredPermissions={[]} />}>
        <Route path='select-agreement-two' element={<SelectAgreementToStart />}></Route>
        <Route path="supplier-two" element={<Layout />}>
          <Route index element={<SelectDocumentsTwoModeAuth />} />
        </Route>
      </Route> */}

    </Routes >
  </>
  );
};

function App() {
  return (
    <BrowserRouter basename="/financiamientocuentasporpagar/">
      <AuthProvider>
        <AgreementProvider>
          <AppContent />
        </AgreementProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;