import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Register user (Mock version)
    const registerUser = async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password.length >= 6) {
                    const user = {
                        email,
                        username: email.split('@')[0],
                        photo: null
                    };
                    setCurrentUser(user);
                    localStorage.setItem('user', JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password (min 6 characters)'));
                }
            }, 1000);
        });
    }

    // Login user (Mock version)
    const loginUser = async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const user = {
                        email,
                        username: email.split('@')[0],
                        photo: null
                    };
                    setCurrentUser(user);
                    localStorage.setItem('user', JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    }

    // Sign in with Google (Mock version)
    const signInWithGoogle = async () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = {
                    email: 'user@gmail.com',
                    username: 'Google User',
                    photo: 'https://via.placeholder.com/150'
                };
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                resolve(user);
            }, 1000);
        });
    }

    // Logout user
    const logout = () => {
        return new Promise((resolve) => {
            setCurrentUser(null);
            localStorage.removeItem('user');
            resolve();
        });
    }

    // Check if user is logged in on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing saved user:', error);
            }
        }
    }, []);

    const value = {
        currentUser,
        loading,
        registerUser,
        loginUser,
        signInWithGoogle,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}