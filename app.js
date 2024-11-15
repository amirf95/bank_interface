
let authenticatedUser = null; // To store the authenticated user

// User Class
class User {
    constructor(name, surname, email, phone_number, pin) {
        this.pin = pin;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone_number = phone_number;
        this.bankAccount = null; // Will be linked to a BankAccount instance
    }

    setBankAccount(bankAccount) {
        this.bankAccount = bankAccount;
    }
}

// BankAccount Class
class BankAccount {
    constructor(accountNumber, balance = 1000) {
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.transactions = []; // To store transaction history
    }

    getBalance() {
        return this.balance;
    }

    withdraw(amount) {
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be positive.");
        }
        if (amount > this.balance) {
            throw new Error("Insufficient balance.");
        }
        this.balance -= amount;
        this.transactions.push({
            type: 'Withdrawal',
            amount: amount,
            date: new Date()
        });
    }

    deposit(amount) {
        if (amount <= 0) {
            throw new Error("Deposit amount must be positive.");
        }
        this.balance += amount;
        this.transactions.push({
            type: 'Deposit',
            amount: amount,
            date: new Date()
        });
    }

    getTransactionHistory() {
        return this.transactions;
    }
}

// Card Class
class Card {
    constructor(cardNumber, expiryDate, bankAccount) {
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
        this.bankAccount = bankAccount;
    }

    validateExpiryDate() {
        const today = new Date();
        const expiry = new Date(this.expiryDate);
        return expiry > today;
    }

    getBankAccount() {
        return this.bankAccount;
    }
}

// Example Users and Accounts
const user1 = new User("John", "Doe", "john.doe@example.com", "1234567890", "1234");
const account1 = new BankAccount("ACC123456", 1000);
user1.setBankAccount(account1);

const user2 = new User("Jane", "Smith", "jane.smith@example.com", "0987654321", "2002");
const account2 = new BankAccount("ACC654321", 500);
user2.setBankAccount(account2);

// All users in the system
const users = [user1, user2];

// Function to handle PIN check
function checkPIN() {
    const pin = document.getElementById("pin").value;
    // Find the user by PIN
    authenticatedUser = users.find(user => user.pin === pin);

    if (authenticatedUser) {
        const userToStore = {
            ...authenticatedUser,
            bankAccount: {
                accountNumber: authenticatedUser.bankAccount.accountNumber,
                balance: authenticatedUser.bankAccount.balance
            }
        };
        localStorage.setItem('authenticatedUser', JSON.stringify(userToStore));
        Swal.fire({
            icon: 'success',
            title: 'PIN Accepted',
            text: 'Access granted. Redirecting...',
            timer: 2000,
            showConfirmButton: false
        });
        setTimeout(() => {
            window.location.href = "withdraw.html";
        }, 2000);
    } else {
        Swal.fire({
            title: 'ERROR',
            text: 'Wrong PIN',
            icon: 'error',
            confirmButtonText: 'Retry'
        });
    }
}

// Function to display user details
function show_details() {
    const authenticatedUser = JSON.parse(localStorage.getItem('authenticatedUser'));
    if (!authenticatedUser) {
        Swal.fire({
            title: 'Error',
            text: 'No user is authenticated. Please enter your PIN first.',
            icon: 'warning',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = "indexx.html"; // Redirect to login page if not authenticated
        });
        return;
    }
    
    authenticatedUser.bankAccount = new BankAccount(authenticatedUser.bankAccount.accountNumber, authenticatedUser.bankAccount.balance);
    const userInfo = document.getElementById('UserInfo');
    if (userInfo.style.display === 'none' || userInfo.style.display === '') {
        // Populate user info dynamically
        userInfo.innerHTML = `
            <h1>User Information</h1>
            <div class="info-pair"><p><strong>Name & Surname:</strong></p><p>${authenticatedUser.name} ${authenticatedUser.surname}</p></div>
            <div class="info-pair"><p><strong>Account Number:</strong></p><p>${authenticatedUser.bankAccount.accountNumber}</p></div>
            <div class="info-pair"><p><strong>Balance:</strong></p><p id="balanceDisplay">$${authenticatedUser.bankAccount.getBalance()}</p></div>
            <div class="info-pair"><p><strong>Email Address:</strong></p><p>${authenticatedUser.email}</p></div>
            <div class="info-pair"><p><strong>Phone Number:</strong></p><p>${authenticatedUser.phone_number}</p></div>
        `;
        userInfo.style.display = 'block'; // Show the user info
    } else {
        userInfo.style.display = 'none'; // Hide the user info
    }
}

// Function to handle withdrawal
function withdraw() {

    let authenticatedUser = JSON.parse(localStorage.getItem('authenticatedUser'));

    if (!authenticatedUser) {
        Swal.fire({
            title: 'Error',
            text: 'User not authenticated.',
            icon: 'error',
            confirmButtonText: 'Retry'
        });
        return;
    }
    authenticatedUser.bankAccount = new BankAccount(authenticatedUser.bankAccount.accountNumber, authenticatedUser.bankAccount.balance);

    const amount = parseInt(document.getElementById("amount").value);
    try {
        authenticatedUser.bankAccount.withdraw(amount);
        Swal.fire({
            title: 'Transaction Successful',
            text: `You have withdrawn $${amount}. Your new balance is $${authenticatedUser.bankAccount.getBalance()}.`,
            icon: 'success',
            confirmButtonText: 'OK'
        });
        document.getElementById("balanceDisplay").innerText = ` $${authenticatedUser.bankAccount.getBalance()}`;
    
        const updatedUser = {
            ...authenticatedUser,
            bankAccount: {
                accountNumber: authenticatedUser.bankAccount.accountNumber,
                balance: authenticatedUser.bankAccount.balance
            }
        };
        localStorage.setItem('authenticatedUser', JSON.stringify(updatedUser));
    } catch (error) {
        Swal.fire({
            title: 'Transaction Failed',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Try Again'
        });
    }
}

// Function to finish the session
function finish() {
    Swal.fire({
        title: 'Thank You!',
        text: 'Please take your card.',
        icon: 'info',
        confirmButtonText: 'Finish'
    }).then(() => {
        authenticatedUser = null; // Reset the authenticated user
        window.location.href = "indexx.html";
    });
}

// Function to go home
function goHome() {
    window.location.href = "indexx.html"; // Go back to home page via the button
}
