// Variabel global untuk menyimpan data
let cardData = null;
let userData = null;
let banksList = [];
let currentSection = 'home-section';

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const navHome = document.getElementById('nav-home');
    const navRegister = document.getElementById('nav-register');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    
    // Section elements
    const homeSection = document.getElementById('home-section');
    const registerSection = document.getElementById('register-section');
    const loginSection = document.getElementById('login-section');
    const cardGeneratorSection = document.getElementById('card-generator-section');
    
    // Form elements
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const atmForm = document.getElementById('atm-form');
    const balanceForm = document.getElementById('balance-form');
    
    // Button elements
    const btnToRegister = document.getElementById('btn-to-register');
    const btnToLogin = document.getElementById('btn-to-login');
    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');
    const btnUpdateBalance = document.getElementById('btn-update-balance');
    const btnDownload = document.getElementById('btn-download');
    const btnCancel = document.getElementById('btn-cancel');
    
    // Other elements
    const balanceUpdateSection = document.getElementById('balance-update');
    const cardActions = document.getElementById('card-actions');
    const bankSelect = document.getElementById('bank-select');
    
    // Preview elements
    const previewCardNumber = document.getElementById('preview-card-number');
    const previewName = document.getElementById('preview-name');
    const previewExpiry = document.getElementById('preview-expiry');
    const previewCvv = document.getElementById('preview-cvv');
    const previewBalance = document.getElementById('preview-balance');
    const previewCardType = document.getElementById('preview-card-type');
    const previewBankName = document.getElementById('preview-bank-name');
    const atmCard = document.getElementById('atm-card');
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Load banks list
    loadBanks();
    
    // Navigation event listeners
    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('home-section');
    });
    
    navRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('register-section');
    });
    
    navLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('login-section');
    });
    
    navLogout.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Home buttons
    btnToRegister.addEventListener('click', function() {
        showSection('register-section');
    });
    
    btnToLogin.addEventListener('click', function() {
        showSection('login-section');
    });
    
    // Auth form links
    linkToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('register-section');
    });
    
    linkToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('login-section');
    });
    
    // Form submissions
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    atmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateCard();
    });
    
    balanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateBalance();
    });
    
    // Card actions
    btnUpdateBalance.addEventListener('click', function() {
        balanceUpdateSection.style.display = 'block';
        document.getElementById('new-balance').value = cardData ? cardData.balance : 0;
    });
    
    btnCancel.addEventListener('click', function() {
        balanceUpdateSection.style.display = 'none';
    });
    
    btnDownload.addEventListener('click', function() {
        downloadCard();
    });
    
    // Real-time preview updates
    document.getElementById('name').addEventListener('input', function(e) {
        previewName.textContent = e.target.value.toUpperCase() || 'KARTU BANG DUNIA';
    });
    
    document.getElementById('card-type').addEventListener('change', function(e) {
        previewCardType.textContent = e.target.value;
        updateCardStyle();
    });
    
    // Bank selection change
    bankSelect.addEventListener('change', function(e) {
        const selectedBank = banksList.find(bank => bank.id == e.target.value);
        if (selectedBank) {
            previewBankName.textContent = selectedBank.name;
            updateCardStyle(selectedBank.color_scheme);
        }
    });
    
    // Functions
    
    // Show section and hide others
    function showSection(sectionId) {
        // Hide all sections
        homeSection.style.display = 'none';
        registerSection.style.display = 'none';
        loginSection.style.display = 'none';
        cardGeneratorSection.style.display = 'none';
        
        // Show selected section
        document.getElementById(sectionId).style.display = 'block';
        
        // Update active nav
        navHome.classList.remove('active');
        navRegister.classList.remove('active');
        navLogin.classList.remove('active');
        
        // Set active nav
        if (sectionId === 'home-section') {
            navHome.classList.add('active');
        } else if (sectionId === 'register-section') {
            navRegister.classList.add('active');
        } else if (sectionId === 'login-section') {
            navLogin.classList.add('active');
        }
        
        currentSection = sectionId;
    }
    
    // Check if user is logged in
    function checkAuthStatus() {
        fetch('/api/auth/user')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Not logged in');
            })
            .then(data => {
                userData = data.user;
                updateAuthUI(true);
                
                // If user is logged in, show card generator
                if (currentSection === 'login-section' || currentSection === 'register-section') {
                    showSection('card-generator-section');
                }
            })
            .catch(error => {
                userData = null;
                updateAuthUI(false);
            });
    }
    
    // Update UI based on auth status
    function updateAuthUI(isLoggedIn) {
        if (isLoggedIn) {
            navRegister.style.display = 'none';
            navLogin.style.display = 'none';
            navLogout.style.display = 'block';
            
            // Enable card generator
            cardGeneratorSection.style.display = 'block';
        } else {
            navRegister.style.display = 'block';
            navLogin.style.display = 'block';
            navLogout.style.display = 'none';
            
            // Disable card generator if on that page
            if (currentSection === 'card-generator-section') {
                showSection('home-section');
            }
        }
    }
    
    // Load banks list
    function loadBanks() {
        fetch('/api/bank/list')
            .then(response => response.json())
            .then(data => {
                banksList = data.banks;
                
                // Populate bank select
                bankSelect.innerHTML = '<option value="" disabled selected>Pilih Bank</option>';
                
                banksList.forEach(bank => {
                    const option = document.createElement('option');
                    option.value = bank.id;
                    option.textContent = `${bank.name} (${bank.country})`;
                    bankSelect.appendChild(option);
                });
            })
            .catch(error => {
                showNotification('Gagal memuat daftar bank', true);
            });
    }
    
    // Register new user
    function register() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(data => {
                throw new Error(data.error || 'Gagal mendaftar');
            });
        })
        .then(data => {
            userData = data.user;
            updateAuthUI(true);
            showSection('card-generator-section');
            showNotification('Pendaftaran berhasil');
            registerForm.reset();
        })
        .catch(error => {
            showNotification(error.message, true);
        });
    }
    
    // Login user
    function login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(data => {
                throw new Error(data.error || 'Gagal login');
            });
        })
        .then(data => {
            userData = data.user;
            updateAuthUI(true);
            showSection('card-generator-section');
            showNotification('Login berhasil');
            loginForm.reset();
        })
        .catch(error => {
            showNotification(error.message, true);
        });
    }
    
    // Logout user
    function logout() {
        fetch('/api/auth/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            userData = null;
            updateAuthUI(false);
            showSection('home-section');
            showNotification('Logout berhasil');
        })
        .catch(error => {
            showNotification('Gagal logout', true);
        });
    }
    
    // Generate card
    function generateCard() {
        const name = document.getElementById('name').value;
        const balance = document.getElementById('balance').value;
        const bankId = document.getElementById('bank-select').value;
        const cardType = document.getElementById('card-type').value;
        
        // Find selected bank
        const selectedBank = banksList.find(bank => bank.id == bankId);
        
        fetch('/api/atm/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                balance: balance,
                card_type: cardType,
                bank_id: bankId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal membuat kartu ATM');
            }
            return response.json();
        })
        .then(data => {
            cardData = data;
            updateCardPreview(cardData, selectedBank);
            showNotification('Kartu ATM berhasil dibuat');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat membuat kartu ATM', true);
        });
    }
    
    // Update card preview
    function updateCardPreview(data, bank) {
        previewCardNumber.textContent = formatCardNumber(data.card_number);
        previewName.textContent = data.name;
        previewExpiry.textContent = data.expiry_date;
        previewCvv.textContent = data.cvv;
        previewBalance.textContent = formatCurrency(data.balance);
        previewCardType.textContent = data.card_type;
        
        if (bank) {
            previewBankName.textContent = bank.name;
            updateCardStyle(bank.color_scheme);
        } else {
            updateCardStyle();
        }
        
        // Show card actions
        cardActions.style.display = 'flex';
    }
    
    // Update card style based on type and bank
    function updateCardStyle(bankColorScheme) {
        // Reset classes
        atmCard.className = 'atm-card';
        
        // Add card type class
        const cardType = document.getElementById('card-type').value;
        if (cardType === 'GOLD') {
            atmCard.classList.add('gold');
        } else if (cardType === 'PLATINUM') {
            atmCard.classList.add('platinum');
        }
        
        // Add bank color scheme class if provided
        if (bankColorScheme) {
            atmCard.classList.add('bank-' + bankColorScheme);
        }
    }
    
    // Update balance
    function updateBalance() {
        const newBalance = document.getElementById('new-balance').value;
        
        fetch('/api/atm/update-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                card_number: cardData.card_number,
                balance: newBalance
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal memperbarui saldo');
            }
            return response.json();
        })
        .then(result => {
            // Update data and display
            cardData.balance = result.balance;
            previewBalance.textContent = formatCurrency(result.balance);
            
            // Hide form
            balanceUpdateSection.style.display = 'none';
            showNotification('Saldo berhasil diperbarui');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat memperbarui saldo', true);
        });
    }
    
    // Format card number with spaces
    function formatCardNumber(number) {
        return number.replace(/(\d{4})/g, '$1 ').trim();
    }
    
    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    // Download card (simulation)
    function downloadCard() {
        showNotification('Fitur download kartu akan segera tersedia!');
    }
    
    // Show notification
    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification';
        
        if (isError) {
            notification.classList.add('error');
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
