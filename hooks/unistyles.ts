import { StyleSheet } from 'react-native-unistyles'

const darkTheme = {
    colors: {
        primary: '#231a6e',
        secondary: '#661D7C',
        accent: '#E9E7FD'
    },
    gap: (v: number) => v * 8
}

const otherTheme = {
    colors: {
        primary: '#1c00ff',
        secondary: '#F5F4FB',
        accent: '#008CFF'
    },
    gap: (v: number) => v * 8
}

const appThemes = {
    dark: darkTheme,
    other: otherTheme
}

const breakpoints = {
    xs: 0,
    sm: 300,
    md: 500,
    lg: 800,
    xl: 1200
}

type AppBreakpoints = typeof breakpoints
type AppThemes = typeof appThemes

declare module 'react-native-unistyles' {
    export interface UnistylesThemes extends AppThemes {}
    export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
    settings: {
        initialTheme: 'dark',
    },
    breakpoints,
    themes: appThemes
})