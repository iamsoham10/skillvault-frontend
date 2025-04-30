import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
const Noir = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#E3F2FD',
            100: '#BBDEFB',
            200: '#90CAF9',
            300: '#64B5F6',
            400: '#42A5F5',
            500: '#2196F3',
            600: '#1E88E5',
            700: '#1976D2',
            800: '#1565C0',
            900: '#0D47A1',
            950: '#0B3C89'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#0d5bc9', // Blue in light mode
                    inverseColor: '#ffffff',
                    hoverColor: '#1976D2',
                    activeColor: '#1565C0'
                },
                highlight: {
                    background: '#E3F2FD',
                    color: '#0D47A1'
                }
            },
            dark: {
                primary: {
                    color: '##3684f2', // Orange in dark mode
                    inverseColor: '#212121',
                    hoverColor: '#FB8C00',
                    activeColor: '#F57C00'
                },
                highlight: {
                    background: '#333',
                    color: '#FFEB3B'
                }
            }
        }
    }
});

export default Noir;