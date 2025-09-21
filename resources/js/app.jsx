import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import "./Pages/i18n";
import { ThemeProvider } from './Context/ThemeContext';
import { CurrencyProvider } from '../js/Context/CurrencyContext ';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
               <CurrencyProvider>

                <App {...props} />
              
                </CurrencyProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
