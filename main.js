let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let maxScore = 0;
let countdownTimer;

function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

function fetchQuestions() {
    return fetch('questions.json')
        .then((response) => response.json())
        .then((data) => {
            const last100Questions = data.slice(-100);
            questions = shuffleArray(last100Questions).slice(0, 20);
            maxScore = questions.reduce((total, question) => total + question.points, 0);
            displayQuestion();
            updateScoreDisplay();
        })
        .catch((error) => {
            console.error('Error fetching questions:', error);
        });
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById("question").innerText = question.question;
    const questionImage = document.getElementById("question-image");

    if (question.image_link) {
        questionImage.src = question.image_link;
        questionImage.style.display = "block";
    } else {
        questionImage.style.display = "none";
    }

    if (question.type === 'multiple_choice') {
        document.getElementById("multiple_choice_options").classList.remove('hidden');
        document.getElementById("short_answer_input").classList.add('hidden');
        document.getElementById("option-a").innerText = question.options[0];
        document.getElementById("option-b").innerText = question.options[1];
        document.getElementById("option-c").innerText = question.options[2];
        document.getElementById("option-d").innerText = question.options[3];
    } else if (question.type === 'short_answer') {
        document.getElementById("multiple_choice_options").classList.add('hidden');
        document.getElementById("short_answer_input").classList.remove('hidden');
        document.getElementById("short_answer").value = "";
    }
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
}

async function submitAnswer() {
    const teamName = document.getElementById('team_name').value;
    const id = questions[currentQuestionIndex].id.toString(10);
    let answer;

    if (questions[currentQuestionIndex].type === 'multiple_choice') {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;
        answer = selectedOption.value;
    } else if (questions[currentQuestionIndex].type === 'short_answer') {
        answer = document.getElementById("short_answer").value.trim();
    }

    const response = await fetch('https://aitrivia.online/submit_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
            "id": id,
            "answer": answer,
            "team_name": teamName,
            "table": "grokkers"
        }),
    });

    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (responseData.message && responseData.message.includes("Correct")) {
        console.log("Answer is correct");
        score += questions[currentQuestionIndex].points;
        updateScoreDisplay();
    } else {
        console.log("Answer is incorrect");
    }
    currentQuestionIndex++;
    displayQuestion();

    // Add the startCountdown() function call here
    startCountdown();
}


function showResult() {
    document.querySelector('.question-container').classList.add('hidden');
    document.getElementById("result").innerText = `Your score: ${score}/${maxScore}`;
    document.getElementById("result").classList.remove('hidden');

    setTimeout(() => {
        let baseurl;
        if (window.location.hostname === "sanjin84.github.io") {
            baseurl = "/AITrivia";
        } else {
            baseurl = "";
        }
        window.location.href = `${baseurl}/pages/rankings.html`;
    }, 8000); // 5000ms (5 seconds) delay before redirecting
}


// Update the displayed score
function updateScoreDisplay() {
    document.getElementById("score-display").innerText = `Score: ${score}`;
}


function showQuizContainer() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("team-name-display").innerText = document.getElementById("team_name").value;

    startQuiz();
}


// Login function to authenticate the user
async function login() {
    console.log("Login initiated");
    const teamName = document.getElementById("team_name").value;
    console.log("team fetched");
    const response = await fetch("https://aitrivia.online/quick_signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: teamName
        }),
    });

    const responseData = await response.json();
    console.log("Response arrived");
    console.log(responseData);
    const duplicateNameError = document.getElementById("duplicate-name-error");

    if (response.status === 401) {
        console.log("Login failed");
        return;
    }

    if (responseData.message === "Team already exists") {
        duplicateNameError.classList.remove("hidden");
        return;
    } else {
        duplicateNameError.classList.add("hidden");
    }

    // Store the access token
    localStorage.setItem("access_token", responseData.access_token);
    console.log("Login successful");

    showQuizContainer();
}



// Fetch questions when the script is loaded
fetchQuestions();


function startCountdown() {
    let timeLeft;
    if (questions[currentQuestionIndex].type === 'multiple_choice') {
        timeLeft = 15;
    } else if (questions[currentQuestionIndex].type === 'short_answer') {
        timeLeft = 30;
    }
    document.getElementById("countdown-display").innerText = `Time left: ${timeLeft}`;

    countdownTimer = setInterval(() => {
        timeLeft--;
        document.getElementById("countdown-display").innerText = `Time left: ${timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(countdownTimer);
            submitFailingAnswer();
        }
    }, 1000);
}

async function submitFailingAnswer() {
    const teamName = document.getElementById('team_name').value;
    const id = questions[currentQuestionIndex].id.toString(10);
    let answer;

    if (questions[currentQuestionIndex].type === 'multiple_choice') {
        answer = 'x';
    } else if (questions[currentQuestionIndex].type === 'short_answer') {
        answer = document.getElementById("short_answer").value.trim();
    }

    const response = await fetch('https://aitrivia.online/submit_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
            "id": id,
            "answer": answer,
            "team_name": teamName,
            "table": "grokkers"
        }),
    });

    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (responseData.message && responseData.message.includes("Correct")) {
        console.log("Answer is correct");
        score += questions[currentQuestionIndex].points;
        updateScoreDisplay();
    } else {
        console.log("Answer is incorrect");
    }
    currentQuestionIndex++;
    displayQuestion();
    startCountdown();
}


function startQuiz() {
    displayQuestion();
    startCountdown();
}