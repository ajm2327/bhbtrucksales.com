import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme mst be used within a theme provider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        //check local storage
        const stored = localStorage.getItem('darkMode')
        if (stored != null) {
            return JSON.parse(stored)
        }

        //check system preference
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }

        return false
    })

    useEffect(() => {
        //apply theme to doc
        const root = document.documentElement
        if (isDarkMode) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        //save preference to local storage
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    }, [isDarkMode])

    useEffect(() => {
        //listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            //only update if user hasn't manually set a preference
            const stored = localStorage.getItem('darkMode')
            if (stored === null) {
                setIsDarkMode(e.matches)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev)
    }

    const value = {
        isDarkMode,
        toggleTheme,
        theme: isDarkMode ? 'dark' : 'light'
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}