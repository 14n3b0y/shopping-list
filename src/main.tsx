import { createRoot } from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge';
import App from './App';

bridge.send('VKWebAppInit');

createRoot(document.getElementById('root')!).render(<App />);