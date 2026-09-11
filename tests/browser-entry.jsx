import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import {Toaster} from 'sonner';
import {TestAuth} from './browser-auth';
import AdminApp from '../src/admin/AdminApp';
import '../src/index.css';
createRoot(document.getElementById('root')).render(<BrowserRouter><TestAuth><Routes><Route path="/admin/*" element={<AdminApp/>}/></Routes><Toaster/></TestAuth></BrowserRouter>);
