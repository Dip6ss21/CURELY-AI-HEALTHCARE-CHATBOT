
console.log("CURELY JavaScript is connected!");

// =====================================
// GET HTML ELEMENTS
// =====================================

const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const chatMessages = document.getElementById("chat-messages");
const welcomeContent = document.querySelector(".welcome-content");

const homeLink = document.getElementById("home-link");
const historyLink = document.getElementById("history-link");
const symptomLink = document.getElementById("symptom-link");
const healthTipsLink = document.getElementById("health-tips-link");
const emergencyLink = document.getElementById("emergency-link");

const symptomChecker = document.getElementById("symptom-checker");
const symptomButton = document.getElementById("check-symptoms-btn");

const healthTipsSection = document.getElementById("health-tips-section");
const emergencySection = document.getElementById("emergency-section");
const chatSection = document.querySelector(".chat-section");

// Authentication elements
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authMessage = document.getElementById("auth-message");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginOpenBtn = document.getElementById("login-open-btn");
const signupOpenBtn = document.getElementById("signup-open-btn");
const authCloseBtn = document.getElementById("auth-close-btn");

const showLoginLink = document.getElementById("show-login-link");
const showSignupLink = document.getElementById("show-signup-link");

const authButtons = document.getElementById("auth-buttons");
const logoutButton = document.getElementById("logout-btn");
const profileName = document.getElementById("profile-name");

// =====================================
// USER SESSION STATE
// =====================================

// Guest messages exist only in memory.
// They are not stored in localStorage or SQLite.

let isLoggedIn = false;
let guestHistory = [];

// =====================================
// DISPLAY CHAT MESSAGES
// =====================================

function addMessage(message, sender) {
    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message", sender);

    if (sender === "bot-message") {
        messageDiv.innerHTML = DOMPurify.sanitize(
            marked.parse(message)
        );
    } else {
        messageDiv.textContent = message;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// =====================================
// SIDEBAR ACTIVE LINK
// =====================================

function setActiveLink(activeLink) {
    document.querySelectorAll(".nav-item").forEach(function(link) {
        link.classList.remove("active");
    });

    if (activeLink) {
        activeLink.classList.add("active");
    }
}

// =====================================
// HIDE EXTRA SECTIONS
// =====================================

function hideExtraSections() {
    if (symptomChecker) {
        symptomChecker.style.display = "none";
    }

    if (healthTipsSection) {
        healthTipsSection.style.display = "none";
    }

    if (emergencySection) {
        emergencySection.style.display = "none";
    }
}

// =====================================
// SHOW HOME
// =====================================

function showHome() {
    setActiveLink(homeLink);

    if (chatSection) {
        chatSection.style.display = "flex";
    }

    welcomeContent.style.display = "block";
    chatMessages.style.display = "none";
    chatMessages.innerHTML = "";

    hideExtraSections();
}

// =====================================
// SHOW CHAT HISTORY
// =====================================

async function showChatHistory() {
    setActiveLink(historyLink);

    if (chatSection) {
        chatSection.style.display = "flex";
    }

    welcomeContent.style.display = "none";
    chatMessages.style.display = "flex";

    hideExtraSections();

    await loadChatHistory();
}

// =====================================
// SHOW SYMPTOM CHECKER
// =====================================

function showSymptomChecker() {
    setActiveLink(symptomLink);

    if (chatSection) {
        chatSection.style.display = "none";
    }

    hideExtraSections();

    if (symptomChecker) {
        symptomChecker.style.display = "block";

        symptomChecker.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// =====================================
// SHOW HEALTH TIPS
// =====================================

function showHealthTips() {
    setActiveLink(healthTipsLink);

    if (chatSection) {
        chatSection.style.display = "none";
    }

    hideExtraSections();

    if (healthTipsSection) {
        healthTipsSection.style.display = "block";

        healthTipsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// =====================================
// SHOW EMERGENCY HELP
// =====================================

function showEmergencyHelp() {
    setActiveLink(emergencyLink);

    if (chatSection) {
        chatSection.style.display = "none";
    }

    hideExtraSections();

    if (emergencySection) {
        emergencySection.style.display = "block";

        emergencySection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// =====================================
// AUTHENTICATION MODAL
// =====================================

function openAuthModal(type) {
    if (!authModal) return;

    authModal.style.display = "flex";
    authMessage.textContent = "";

    if (type === "signup") {
        loginForm.style.display = "none";
        signupForm.style.display = "flex";

        authTitle.textContent = "Create Your Account";
        authSubtitle.textContent = "Join CURELY today.";

    } else {
        signupForm.style.display = "none";
        loginForm.style.display = "flex";

        authTitle.textContent = "Welcome Back";
        authSubtitle.textContent = "Login to your account.";
    }
}

function closeAuthModal() {
    if (!authModal) return;

    authModal.style.display = "none";
    authMessage.textContent = "";

    loginForm.reset();
    signupForm.reset();
}

// Open Login
if (loginOpenBtn) {
    loginOpenBtn.addEventListener("click", function() {
        openAuthModal("login");
    });
}

// Open Sign Up
if (signupOpenBtn) {
    signupOpenBtn.addEventListener("click", function() {
        openAuthModal("signup");
    });
}

// Close modal
if (authCloseBtn) {
    authCloseBtn.addEventListener("click", closeAuthModal);
}

// Close when clicking outside the form
if (authModal) {
    authModal.addEventListener("click", function(event) {
        if (event.target === authModal) {
            closeAuthModal();
        }
    });
}

// Switch to Login
if (showLoginLink) {
    showLoginLink.addEventListener("click", function(event) {
        event.preventDefault();
        openAuthModal("login");
    });
}

// Switch to Sign Up
if (showSignupLink) {
    showSignupLink.addEventListener("click", function(event) {
        event.preventDefault();
        openAuthModal("signup");
    });
}

// =====================================
// UPDATE USER INTERFACE
// =====================================

function updateUserInterface(loggedIn, name) {
    isLoggedIn = loggedIn;

    if (loggedIn) {
        profileName.textContent = name || "User";

        authButtons.style.display = "none";
        logoutButton.style.display = "inline-block";

    } else {
        profileName.textContent = "Guest User";

        authButtons.style.display = "flex";
        logoutButton.style.display = "none";
    }
}

// =====================================
// CHECK LOGIN STATUS
// =====================================

async function checkAuthStatus() {
    try {
        const response = await fetch("/auth/status");
        const data = await response.json();

        updateUserInterface(
            data.logged_in,
            data.name
        );

    } catch (error) {
        console.error("Authentication status error:", error);

        updateUserInterface(false, null);
    }
}

// =====================================
// USER REGISTRATION
// =====================================

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;

        const submitButton = signupForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Creating account...";

        authMessage.textContent = "";

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed.");
            }

            alert("Your CURELY account has been created successfully!");

            closeAuthModal();

            // Clear guest conversation after account creation.
            guestHistory = [];

            // Reload to initialize the registered user's session.
            window.location.reload();

        } catch (error) {
            authMessage.textContent = error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Create Account";
        }
    });
}

// =====================================
// USER LOGIN
// =====================================

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";

        authMessage.textContent = "";

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            alert("Welcome back to CURELY!");

            closeAuthModal();

            // Guest conversation is not transferred to the account.
            guestHistory = [];

            window.location.reload();

        } catch (error) {
            authMessage.textContent = error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Login";
        }
    });
}

// =====================================
// USER LOGOUT
// =====================================

if (logoutButton) {
    logoutButton.addEventListener("click", async function() {
        const confirmed = confirm("Are you sure you want to log out?");

        if (!confirmed) return;

        try {
            const response = await fetch("/logout", {
                method: "POST"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Logout failed.");
            }

            // Clear the in-memory conversation.
            guestHistory = [];

            window.location.reload();

        } catch (error) {
            alert("Unable to log out. Please try again.");
            console.error("Logout error:", error);
        }
    });
}

// =====================================
// SEND MESSAGE TO FLASK
// =====================================

async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) {
        return;
    }

    if (chatSection) {
        chatSection.style.display = "flex";
    }

    hideExtraSections();

    welcomeContent.style.display = "none";
    chatMessages.style.display = "flex";

    addMessage(message, "user-message");

    userInput.value = "";
    sendButton.disabled = true;

    const loadingMessage = document.createElement("div");

    loadingMessage.classList.add("message", "bot-message");
    loadingMessage.textContent = "CURELY is thinking...";

    chatMessages.appendChild(loadingMessage);

    try {
        const requestBody = {
            message: message
        };

        // Only guests send temporary conversation context.
        if (!isLoggedIn) {
            requestBody.history = guestHistory.slice(-10);
        }

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        loadingMessage.remove();

        if (!response.ok) {
            throw new Error(data.reply || "Something went wrong.");
        }

        addMessage(data.reply, "bot-message");

        // Keep guest conversation in memory only.
        if (!isLoggedIn) {
            guestHistory.push({
                role: "user",
                content: message
            });

            guestHistory.push({
                role: "assistant",
                content: data.reply
            });

            guestHistory = guestHistory.slice(-10);
        }

        // Display an emergency warning if the backend provides one.
        if (data.emergency && data.emergency.detected) {
            addMessage(data.emergency.message, "bot-message");
        }

    } catch (error) {
        loadingMessage.remove();

        addMessage(
            "Sorry, something went wrong. Please try again.",
            "bot-message"
        );

        console.error("Chat error:", error);

    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

// =====================================
// SEND MESSAGE EVENTS
// =====================================

if (sendButton && userInput) {
    sendButton.addEventListener("click", sendMessage);

    userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
}

// =====================================
// LOAD CHAT HISTORY
// =====================================

async function loadChatHistory() {
    chatMessages.innerHTML = "";

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading chat history...";

    chatMessages.appendChild(loadingMessage);

    try {
        const response = await fetch("/history");

        if (!response.ok) {
            throw new Error("Unable to load chat history.");
        }

        const history = await response.json();

        chatMessages.innerHTML = "";

        if (!Array.isArray(history)) {
            throw new Error("Invalid chat history response.");
        }

        if (history.length === 0) {
            addMessage(
                isLoggedIn
                    ? "No saved conversations found. Start chatting with CURELY!"
                    : "You are using CURELY as a guest. Log in to save your chat history.",
                "bot-message"
            );

            return;
        }

        history.forEach(function(item) {
            const sender = item.role === "user"
                ? "user-message"
                : "bot-message";

            addMessage(item.message, sender);
        });

    } catch (error) {
        console.error("History loading error:", error);

        chatMessages.innerHTML = "";

        addMessage(
            "Unable to load chat history. Please refresh and try again.",
            "bot-message"
        );
    }
}

// =====================================
// SYMPTOM CHECKER
// =====================================

if (symptomButton) {
    symptomButton.addEventListener("click", async function() {

        const selectedSymptoms = Array.from(
            document.querySelectorAll(
                'input[name="symptoms"]:checked'
            )
        ).map(function(input) {
            return input.value;
        });

        const duration = document.getElementById(
            "symptom-duration"
        ).value;

        const severity = document.getElementById(
            "symptom-severity"
        ).value;

        const resultBox = document.getElementById("symptom-result");

        if (selectedSymptoms.length === 0) {
            resultBox.textContent =
                "Please select at least one symptom.";
            return;
        }

        if (!duration || !severity) {
            resultBox.textContent =
                "Please select symptom duration and severity.";
            return;
        }

        symptomButton.disabled = true;
        symptomButton.textContent = "Checking symptoms...";

        resultBox.textContent =
            "CURELY is preparing your health guidance...";

        try {
            const response = await fetch("/symptom-check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    symptoms: selectedSymptoms,
                    duration: duration,
                    severity: severity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.reply || "Unable to check symptoms."
                );
            }

            resultBox.innerHTML = DOMPurify.sanitize(
                marked.parse(data.reply)
            );

        } catch (error) {
            resultBox.textContent =
                "Sorry, we couldn't process your request. Please try again.";

            console.error("Symptom checker error:", error);

        } finally {
            symptomButton.disabled = false;
            symptomButton.textContent = "Check My Symptoms";
        }
    });
}

// =====================================
// SIDEBAR NAVIGATION
// =====================================

if (homeLink) {
    homeLink.addEventListener("click", function(event) {
        event.preventDefault();
        showHome();
    });
}

if (historyLink) {
    historyLink.addEventListener("click", function(event) {
        event.preventDefault();
        showChatHistory();
    });
}

if (symptomLink) {
    symptomLink.addEventListener("click", function(event) {
        event.preventDefault();
        showSymptomChecker();
    });
}

if (healthTipsLink) {
    healthTipsLink.addEventListener("click", function(event) {
        event.preventDefault();
        showHealthTips();
    });
}

if (emergencyLink) {
    emergencyLink.addEventListener("click", function(event) {
        event.preventDefault();
        showEmergencyHelp();
    });
}

// =====================================
// HEALTH TIPS CATEGORY FILTER
// =====================================

const categoryButtons = document.querySelectorAll(".category-btn");
const healthTipCards = document.querySelectorAll(".health-tip-card");

categoryButtons.forEach(function(button) {
    button.addEventListener("click", function() {

        const selectedCategory = button.dataset.category;

        categoryButtons.forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        healthTipCards.forEach(function(card) {
            const cardCategory = card.dataset.category;

            if (
                selectedCategory === "all" ||
                selectedCategory === cardCategory
            ) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// =====================================
// INITIALIZE CURELY
// =====================================

checkAuthStatus();

console.log("CURELY authentication and navigation are ready!");

// =====================================
// CLICKABLE WELCOME CARDS
// =====================================

document.querySelectorAll(".suggestion-card").forEach(function(card) {

    card.addEventListener("click", function() {

        const action = card.dataset.action;

        if (action === "wellness") {
            showHealthTips();
        }

        else if (action === "symptoms") {
            showSymptomChecker();
        }

        else if (action === "health" || action === "anything") {

            showHome();

            userInput.focus();

            if (action === "health") {
                userInput.placeholder =
                    "Ask CURELY a general health question...";
            } else {
                userInput.placeholder =
                    "Ask CURELY anything...";
            }
        }

    });

});
