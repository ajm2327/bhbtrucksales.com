const express = require('express');
const { body, validationResult } = require('express-validator');
const { authLog, checkAuth } = require('../middleware/auth');
const router = express.Router();

// Admin password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Validation rules for login
const loginValidation = () => {
    return [
        body('password')
            .isLength({ min: 1 })
            .withMessage('Password is required')
    ];
};

// POST /api/auth/login - Admin login
router.post('/login', loginValidation(), async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            authLog('login', false, req.get('User-Agent'));
            return res.status(400).json({
                success: false,
                error: 'Password is required',
                code: 'VALIDATION_ERROR',
                timestamp: new Date().toISOString()
            });
        }

        const { password } = req.body;

        // Check password
        if (password === ADMIN_PASSWORD) {
            // Set session
            req.session.authenticated = true;
            req.session.loginTime = new Date().toISOString();

            console.log('Login successful - session set', {
                sessionId: req.sesssionID,
                authenticated: req.session.authenticated,
                loginTime: req.session.loginTime
            });
            authLog('login', true, req.get('User-Agent'));

            res.json({
                success: true,
                message: 'Login successful',
                timestamp: new Date().toISOString()
            });
        } else {
            authLog('login', false, req.get('User-Agent'));

            // Add small delay to prevent brute force
            await new Promise(resolve => setTimeout(resolve, 1000));

            res.status(401).json({
                success: false,
                error: 'Invalid password',
                code: 'INVALID_CREDENTIALS',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            code: 'LOGIN_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/auth/logout - Admin logout
router.post('/logout', checkAuth, (req, res) => {
    const wasAuthenticated = req.isAuthenticated;

    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({
                success: false,
                error: 'Logout failed',
                code: 'LOGOUT_ERROR',
                timestamp: new Date().toISOString()
            });
        }

        if (wasAuthenticated) {
            authLog('logout', true, req.get('User-Agent'));
        }

        res.json({
            success: true,
            message: 'Logout successful',
            timestamp: new Date().toISOString()
        });
    });
});

// GET /api/auth/verify - Check authentication status
router.get('/verify', checkAuth, (req, res) => {
    console.log('AUTH verify check:', {
        sessionId: req.sessionID,
        hasSession: !!req.session,
        sessionAuth: req.session?.authenticated,
        isAuthenticated: req.isAuthenticated,
        sessionData: req.session
    });
    res.json({
        success: true,
        authenticated: req.isAuthenticated,
        loginTime: req.session?.loginTime || null,
        timestamp: new Date().toISOString()
    });
});

// GET /admin/login - Serve login page
router.get('/admin/login', checkAuth, (req, res) => {
    // If already authenticated, redirect to admin dashboard
    if (req.isAuthenticated) {
        return res.redirect('/admin');
    }

    // Simple HTML login form
    const loginPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - BHB Truck Sales</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f5f5f5;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .login-container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                width: 100%;
                max-width: 400px;
            }
            h1 {
                text-align: center;
                color: #1e40af;
                margin-bottom: 2rem;
            }
            .form-group {
                margin-bottom: 1rem;
            }
            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #374151;
            }
            input[type="password"] {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #d1d5db;
                border-radius: 6px;
                font-size: 1rem;
                box-sizing: border-box;
            }
            input[type="password"]:focus {
                outline: none;
                border-color: #1e40af;
            }
            .login-btn {
                width: 100%;
                background: #1e40af;
                color: white;
                padding: 0.75rem;
                border: none;
                border-radius: 6px;
                font-size: 1rem;
                cursor: pointer;
                margin-top: 1rem;
            }
            .login-btn:hover {
                background: #1d4ed8;
            }
            .login-btn:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
            .error {
                color: #dc2626;
                margin-top: 0.5rem;
                font-size: 0.875rem;
            }
            .loading {
                text-align: center;
                color: #6b7280;
                margin-top: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>🚛 BHB Admin</h1>
            <form id="loginForm">
                <div class="form-group">
                    <label for="password">Admin Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="login-btn" id="loginBtn">Login</button>
                <div id="error" class="error" style="display: none;"></div>
                <div id="loading" class="loading" style="display: none;">Logging in...</div>
            </form>
        </div>

        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const password = document.getElementById('password').value;
                const loginBtn = document.getElementById('loginBtn');
                const errorDiv = document.getElementById('error');
                const loadingDiv = document.getElementById('loading');
                
                // Show loading state
                loginBtn.disabled = true;
                errorDiv.style.display = 'none';
                loadingDiv.style.display = 'block';
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Redirect to admin dashboard
                        window.location.href = '/admin';
                    } else {
                        errorDiv.textContent = data.error || 'Login failed';
                        errorDiv.style.display = 'block';
                    }
                } catch (error) {
                    errorDiv.textContent = 'Connection error. Please try again.';
                    errorDiv.style.display = 'block';
                } finally {
                    loginBtn.disabled = false;
                    loadingDiv.style.display = 'none';
                }
            });
        </script>
    </body>
    </html>
    `;

    res.send(loginPage);
});

module.exports = router;