import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { LanguageProvider } from './context/LanguageContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <UserProfileProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UserProfileProvider>
  </LanguageProvider>
);
