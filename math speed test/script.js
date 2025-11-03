const buttons = document.querySelectorAll(".mode-button");
const quizArea = document.getElementById("quizArea");
const countdownSound = new Audio('sounds/clock tick sound2.mp3')
const startSound = new Audio('sounds/start1.mp3')
const questionSound = new Audio('sounds/keyboard-click-327728.mp3')
const completeSound = new Audio('sounds/complete.mp3')
const stopwatch = document.getElementById('safeTimerDisplay')
const leaderboardContainer = document.getElementById('leaderboardContainer')
const leaderBoardBack = document.getElementById('backButton')
const loading = document.getElementById('loadingMessage')
let currentMode  = ''
startSound.volume = 0.7
let seconds = 0
let timer
let countdownInterval
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentMode = btn.dataset.mode;
        startQuiz(currentMode);
    });
});

function startQuiz(mode) {
    quizArea.hidden = false;
    seconds = 0
    loading.hidden = true
    stopwatch.innerHTML = 0
    clearInterval(timer)
    clearInterval(countdownInterval)
    leaderboardContainer.hidden = true
    
    if (mode === "arithmetic") {
        generateArithmeticQuestion();
    } else if (mode === "algebra") {
        generateAlgebraQuestion();
    } else if (mode === "probability") {
        generateProbabilityQuestion();
    }
}

function generateArithmeticQuestion() {
    const ops = ['*', '+', '-', '/'];
    const question = document.getElementById("question")
    const answerBox = document.getElementById('answerBox')
    const label = document.getElementById('label')
    const cancelQuiz = document.getElementById('cancel')
    const countdownDisplay = document.getElementById('countdown')
    const totalQuestions = 10
    let score = 0;
    let currentQuestion = 0;
    let questionToAnswer = ''
    let op,nums1,nums2,num3;
    let mistakes = []
    const mistakesList = document.getElementById('mistakesList')
    document.getElementById('progressFill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
    mistakesList.innerHTML = ''
    answerBox.hidden = true;
    cancelQuiz.hidden = true;
    label.hidden = true;
    stopwatch.hidden= true
    question.textContent = '';
    countdownDisplay.textContent = '';

    const newAnswerBox = answerBox.cloneNode(true);
    answerBox.parentNode.replaceChild(newAnswerBox, answerBox);
    console.log('Quiz Starts!')

    
    let countdownValue = 2;
    countdownDisplay.textContent = 3;
    document.getElementById('progressText').textContent = 'Loading.'
    countdownSound.currentTime = 0
    countdownSound.play()
    countdownInterval = setInterval(()=>{
        if(countdownValue == 0){
            countdownDisplay.textContent = 'Go!';
            document.getElementById('progressText').textContent = 'Ready'
            startSound.play()
        }
        else if(countdownValue==-1){
            countdownDisplay.textContent = '';
            clearInterval(countdownInterval);
            startQuiz1()
        }
        else{
            countdownSound.currentTime = 0
            countdownSound.play()
            document.getElementById('progressText').textContent = 'Loading' + '.'.repeat(3 - countdownValue + 1)
            countdownDisplay.textContent = countdownValue
        }
        countdownValue-=1
    },1000);

    cancelQuiz.onclick = () => {
        clearInterval(countdownInterval);
        const freshBox = newAnswerBox.cloneNode(true);
        newAnswerBox.parentNode.replaceChild(freshBox, newAnswerBox);
        quizArea.hidden = true;
        document.getElementById('leaderboardContainer').hidden = true
        seconds = 0
        stopwatch.innerHTML=0
        clearInterval(timer)
        mistakesList.innerHTML = ''
    };
    leaderBoardBack.onclick = () =>{
        document.getElementById('leaderboardContainer').hidden = true
    }
    function startQuiz1(){
        stopwatch.hidden = false
        newAnswerBox.value = ''
        cancelQuiz.hidden = false
        newAnswerBox.hidden= false
        label.hidden = false
        question.hidden = false
        timer = setInterval(function(){
            stopwatch.innerHTML=seconds/100;
            seconds+=1;
        }, 10);
        nextQuestion()    
    };

    function nextQuestion(){
        document.getElementById('progressFill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
        if(currentQuestion==10){
            document.getElementById('progressText').textContent = `Complete!`;
            completeSound.play()
        }else{
            document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
        }
        if(currentQuestion>=totalQuestions){
            question.textContent = 'Quiz Over! Score: '+score*10;
            if (score === 10) { // assuming each question is 10 points
                const username = prompt("Perfect score! Enter your name:");
                submitScore(username, currentMode, seconds / 100); 
            } else {
                fetchLeaderboard(currentMode); // still show leaderboard even if score < 100
            }
            newAnswerBox.hidden = true;
            label.hidden = true;
            mistakesList.hidden = false
            mistakesList.innerHTML = '';
            clearInterval(timer)
            mistakes.forEach(([question,user,correct])=>{
                const li = document.createElement('li')
                li.innerHTML = `${question}  <span style='color:red'>→ You: ${user},  </span> <span style='color:green'>Correct: ${correct}</span>`
                mistakesList.appendChild(li)
            })
            return;
        }
        nums1 = Math.floor(Math.random()*100)
        nums2 = Math.floor(Math.random()*100)
        op = ops[Math.floor(Math.random() * ops.length)];
        
        questionToAnswer = nums1+op+nums2
        if(op=='/'){
            question.textContent = questionToAnswer+ ' (round to the nearest tenth)'
        }else{
            question.textContent = questionToAnswer
        }
        currentQuestion+=1
    }

    newAnswerBox.addEventListener("keydown", (e)=>{
        if(e.key == 'Enter'){
            e.preventDefault();
            checkAnswer()
        }
    });

    function checkAnswer(){
        let correct;

        switch (op) {
            case '+': correct = nums1 + nums2; break;
            case '-': correct = nums1 - nums2; break;
            case '*': correct = nums1 * nums2; break;
            case '/': correct = parseFloat((nums1 / nums2).toFixed(1)); break;
        }

        const userAnswer = Number(newAnswerBox.value);

        if (Math.abs(userAnswer - correct) < 0.05){
            score++;
            console.log("correct")
        }else{
            mistakes.push([questionToAnswer,userAnswer,correct])
            console.log('incorrect')
        }
        newAnswerBox.value = "";
        questionSound.currentTime = 0
        questionSound.play()
        nextQuestion();
    }


}



function generateAlgebraQuestion() {
    // randomly choose linear vs quadratic type
    const ops = ['*', '+', '-', '/'];
    const question = document.getElementById("question")
    const answerBox = document.getElementById('answerBox')
    const label = document.getElementById('label')
    const cancelQuiz = document.getElementById('cancel')
    const countdownDisplay = document.getElementById('countdown')
    const totalQuestions = 10
    let mistakes = []
    const mistakesList = document.getElementById('mistakesList')
    mistakesList.innerHTML = ''
    let score = 0;
    let currentQuestion = 0;
    let op,nums1,nums2,nums3,split;
    answerBox.hidden = true;
    cancelQuiz.hidden = true;
    label.hidden = true;
    question.textContent = '';
    let questionToAnswer = ''
    countdownDisplay.textContent = '';
    stopwatch.hidden = true
    seconds = 0
    document.getElementById('progressFill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
    const newAnswerBox = answerBox.cloneNode(true);
    answerBox.parentNode.replaceChild(newAnswerBox, answerBox);
    console.log('Quiz Starts!')

    
    let countdownValue = 2;
    countdownDisplay.textContent = 3;
    document.getElementById('progressText').textContent = 'Loading.'
    countdownSound.currentTime = 0
    countdownSound.play()
    countdownInterval = setInterval(()=>{
        if(countdownValue == 0){
            countdownDisplay.textContent = 'Go!';
            document.getElementById('progressText').textContent = 'Ready'
            startSound.play()
        }
        else if(countdownValue==-1){
            countdownDisplay.textContent = '';
            clearInterval(countdownInterval);
            startQuiz1()
        }
        else{
            countdownDisplay.textContent = countdownValue
            countdownSound.currentTime = 0
            countdownSound.play()
            document.getElementById('progressText').textContent = 'Loading' + '.'.repeat(3 - countdownValue + 1)
        }
        countdownValue-=1
    },1000);

    cancelQuiz.onclick = () => {
        clearInterval(countdownInterval);
        const freshBox = newAnswerBox.cloneNode(true);
        newAnswerBox.parentNode.replaceChild(freshBox, newAnswerBox);
        document.getElementById('leaderboardContainer').hidden = true
        quizArea.hidden = true;
        clearInterval(timer)
        seconds = 0
        stopwatch.innerHTML = 0
        stopwatch.hidden = true
        mistakesList.innerHTML = ''
    };
    leaderBoardBack.onclick = () =>{
        document.getElementById('leaderboardContainer').hidden = true
    }
    function startQuiz1(){
        newAnswerBox.value = ''
        cancelQuiz.hidden = false
        newAnswerBox.hidden= false
        label.hidden = false
        question.hidden = false
        stopwatch.hidden = false
        timer = setInterval(function(){
            stopwatch.innerHTML=seconds/100;
            seconds+=1;
        }, 10);
        nextQuestion()    
    };

    function nextQuestion(){
        document.getElementById('progressFill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
        if(currentQuestion==10){
            document.getElementById('progressText').textContent = `Complete!`;
            completeSound.play()
            clearInterval(timer)
        }else{
            document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
        }
        if(currentQuestion>=totalQuestions){
            question.textContent = 'Quiz Over! Score: '+score*10;
            if (score === 10) { // assuming each question is 10 points
                const username = prompt("Perfect score! Enter your name:");
                submitScore(username, currentMode, seconds / 100); 
            } else {
                fetchLeaderboard(currentMode); // still show leaderboard even if score < 100
            }
            newAnswerBox.hidden = true
            label.hidden = true
            mistakesList.hidden = false
            mistakesList.innerHTML = '';
            mistakes.forEach(([question,user,correct])=>{
                const li = document.createElement('li')
                li.innerHTML = `${question}  <span style='color:red'>→ You: ${user},  </span> <span style='color:green'>Correct: ${correct}</span>`
                mistakesList.appendChild(li)
            })
            return;
        }
        split = Math.floor(Math.random()*2)
        if(split == 0){
            //linear algebra
            nums1 = Math.floor(Math.random()*100)
            nums2 = Math.floor(Math.random()*100)
            op = ops[Math.floor(Math.random() * ops.length)];
            questionToAnswer = 'x'+op+nums1+'='+nums2+'   x = ?'
            
            if(op=='/'){
                question.textContent = questionToAnswer+ ' (round to the nearest tenth)'
            }else{
                question.textContent = questionToAnswer
            }
            
            
        }else{
            //quadratic algebra
            do{
                nums1 = Math.floor(Math.random()*100)
                nums2 = Math.floor(Math.random()*100)
                nums3 = Math.ceil(Math.random()*2)
            }while(nums2*nums2 - 4*nums1*nums3<0)
            questionToAnswer = nums3+'x² + '+nums2+'x + '+nums1+' = 0   x = ?'
            question.textContent = questionToAnswer + '  (round to the nearest tenth)'
        }
        
        currentQuestion+=1
    }

    newAnswerBox.addEventListener("keydown", (e)=>{
        if(e.key == 'Enter'){
            e.preventDefault();
            checkAnswer()
        }
    });

    function checkAnswer(){
        let correct,correct1;
        if(split == 0){
            //linear
            switch (op) {
                case '+': correct = nums2-nums1; break;
                case '-': correct = nums1+nums2; break;
                case '*': correct = parseFloat((nums2 / nums1).toFixed(1)); break;
                case '/': correct = nums2*nums1; break;
            }

        }else{
            //quadratic num3 = a    num2 = b   nums1 = c
            const discriminant = nums2 * nums2 - 4 * nums3 * nums1;
            const sqrtDisc = Math.sqrt(discriminant);

            correct  = parseFloat(((-nums2 + sqrtDisc) / (2 * nums3)).toFixed(1));
            correct1 = parseFloat(((-nums2 - sqrtDisc) / (2 * nums3)).toFixed(1));
            
        }
        

        const userAnswer = Number(newAnswerBox.value);

        if (Math.abs(userAnswer - correct) < 0.05 || Math.abs(userAnswer - correct1) < 0.05){
            score++;
            console.log("correct")
        }else{
            if(split==0){
                mistakes.push([questionToAnswer,userAnswer,correct])
            }else{
                mistakes.push([questionToAnswer,userAnswer,`${correct} or ${correct1}`])
            }
            
            console.log('incorrect')
        }
        newAnswerBox.value = "";
        nextQuestion();
        questionSound.currentTime = 0
        questionSound.play()
    }
}

function generateProbabilityQuestion() {
    const question = document.getElementById("question")
    const answerBox = document.getElementById('answerBox')
    const label = document.getElementById('label')
    const cancelQuiz = document.getElementById('cancel')
    const countdownDisplay = document.getElementById('countdown')
    const totalQuestions = 10
    let mistakes = []
    const mistakesList = document.getElementById('mistakesList')
    mistakesList.innerHTML = ''
    mistakesList.hidden = true
    let questionToAnswer = ''
    let score = 0;
    let currentQuestion = 0;
    let n,k,split;
    let ans = []
    document.getElementById('progressFill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
    answerBox.hidden = true;
    cancelQuiz.hidden = true;
    label.hidden = true;
    question.textContent = '';
    countdownDisplay.textContent = '';
    stopwatch.hidden = true
    seconds = 0

    const newAnswerBox = answerBox.cloneNode(true);
    answerBox.parentNode.replaceChild(newAnswerBox, answerBox);
    console.log('Quiz Starts!')

    
    let countdownValue = 2;
    countdownDisplay.textContent = 3;
    document.getElementById('progressText').textContent = 'Loading.'
    countdownSound.currentTime = 0
    countdownSound.play()
    countdownInterval = setInterval(()=>{
        if(countdownValue == 0){
            countdownDisplay.textContent = 'Go!';
            document.getElementById('progressText').textContent = 'Ready'
            startSound.play()
        }
        else if(countdownValue==-1){
            countdownDisplay.textContent = '';
            clearInterval(countdownInterval);
            startQuiz1()
        }
        else{
            countdownSound.currentTime = 0
            countdownSound.play()
            countdownDisplay.textContent = countdownValue
            document.getElementById('progressText').textContent = 'Loading' + '.'.repeat(3 - countdownValue + 1)
        }
        countdownValue-=1
    },1000);

    cancelQuiz.onclick = () => {
        clearInterval(countdownInterval);
        const freshBox = newAnswerBox.cloneNode(true);
        newAnswerBox.parentNode.replaceChild(freshBox, newAnswerBox);
        quizArea.hidden = true;
        seconds = 0
        stopwatch.innerHTML=0
        clearInterval(timer)
        mistakesList.innerHTML = ''
        document.getElementById('leaderboardContainer').hidden = true
    };
    leaderBoardBack.onclick = () =>{
        document.getElementById('leaderboardContainer').hidden = true
    }

    function startQuiz1(){
        newAnswerBox.value = ''
        cancelQuiz.hidden = false
        newAnswerBox.hidden= false
        label.hidden = false
        stopwatch.hidden = false
        clearInterval(timer)
        question.hidden = false
        timer = setInterval(function(){
            stopwatch.innerHTML=seconds/100;
            seconds+=1;
        }, 10);
        nextQuestion()    
    };

    function nextQuestion(){
        document.getElementById('progressFill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
        if(currentQuestion==10){
            document.getElementById('progressText').textContent = `Complete!`;
            clearInterval(timer)
            completeSound.play()
        }else{
            document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
        }
        if(currentQuestion >= totalQuestions){
            question.textContent = 'Quiz Over! Score: ' + score*10;
            if (score === 10) { // assuming each question is 10 points
                const username = prompt("Perfect score! Enter your name:");
                submitScore(username, currentMode, seconds / 100); 
            } else {
                fetchLeaderboard(currentMode); // still show leaderboard even if score < 100
            }
            newAnswerBox.hidden = true
            label.hidden = true
            mistakesList.hidden = false
            mistakes.forEach(([question,user,correct])=>{
                const li = document.createElement('li')
                li.innerHTML = `${question}  <span style='color:red'>→ You: ${user},  </span> <span style='color:green'>Correct: ${correct}</span>`
                mistakesList.appendChild(li)
            })
            return;
        }

        split = Math.floor(Math.random() * 3); 
        currentQuestion++;

        if(split == 0){
            // permutations
            k = Math.ceil(Math.random() * 3) + 1;
            n = k + Math.ceil(Math.random() * 4);
            const templates = [
                `How many ways can the top ${k} places be awarded among ${n} runners?`,
                `How many ${k}-digit codes can be made using digits 1-${n} with no repeats?`,
                `We have ${n} books and ${k} spots on a shelf. How many ordered selections?`
            ];
            questionToAnswer = templates[Math.floor(Math.random() * templates.length)];
            question.textContent = questionToAnswer

        } else if(split == 1){
            // combinations
            k = Math.ceil(Math.random() * 3) + 1;
            n = k + Math.ceil(Math.random() * 4);
            const templates = [
                `How many ways can you choose ${k} students out of ${n}?`,
                `A bag has ${n} different marbles. How many ways to pick ${k}?`,
                `There are ${n} clubs and you can join ${k}. How many sets can you choose?`
            ];
            questionToAnswer = templates[Math.floor(Math.random() * templates.length)];
            question.textContent = questionToAnswer

        } else {
            // probability from counting
            let outcomes = Math.floor(Math.random() * 6) + 6;
            let favorable = Math.floor(Math.random() * outcomes);
            questionToAnswer = `If a random event has ${favorable} favorable outcomes out of ${outcomes} equally likely outcomes,\n` +
                `what is the probability? (Answer as a simplified fraction or decimal)`;
            question.textContent = questionToAnswer
            n = outcomes;
            k = favorable;
        }
    }

    newAnswerBox.addEventListener("keydown", (e)=>{
        if(e.key == 'Enter'){
            e.preventDefault();
            checkAnswer()
        }
    });

    function factorial(n) {
        if (n < 0) return undefined; 
        let ans = 1;
        for (let i = 1; i <= n; i++) {
            ans *= i;
        }
        return ans;
    }

    function gcd(a, b) {
      if (b === 0) {
        return a;
      } else {
        return gcd(b, a % b);
      }
    }
    function checkAnswer(){
        let correct;

        if(split == 0){
            correct = factorial(n) / factorial(n - k); // permutations
            ans[0] = factorial(n) / gcd(factorial(n),factorial(n-k))
            ans[1] = factorial(n-k) / gcd(factorial(n),factorial(n-k))
        } else if(split == 1){
            correct = factorial(n) / (factorial(n-k)*factorial(k))
            ans[0] = factorial(n) / gcd(factorial(n),factorial(n-k)*factorial(k))
            ans[1] = (factorial(n-k)*factorial(k)) / gcd(factorial(n),factorial(n-k)*factorial(k))
        } else {
            correct = k / n; // probability
            ans[0] = k / gcd(k,n)
            ans[1] =  n / gcd(k,n)
        }
        let user;
        if(newAnswerBox.value.includes('/')){
            let arr = newAnswerBox.value.split('/')
            user = Number(arr[0])/Number(arr[1])
        }
        user = Number(newAnswerBox.value);
        
        if (Math.abs(user - correct) < 0.005){
            score++;
            console.log("correct");
        } else {
            mistakes.push([questionToAnswer,user,`${correct} or ${ans[0]} / ${ans[1]}`])
            console.log("incorrect");
        }

        newAnswerBox.value = "";
        nextQuestion();
        questionSound.currentTime = 0
        questionSound.play()
    }
}



//leaderboard

const renderUrl = "https://mathspeedtestappapi-yxqo.onrender.com"; // your Flask app URL

function fetchLeaderboard(mode) {
    loading.hidden = false;

    fetch(`${renderUrl}/leaderboard/${mode}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("leaderboardContainer");
            const list = document.getElementById("leaderboardList");
            list.innerHTML = "";
            if (data.length === 0) {
                list.innerHTML = "<li>No entries yet</li>";
            } else {
                data.forEach((entry, index) => {
                    const li = document.createElement("li");
                    li.textContent = `${index + 1}. ${entry.name} - ${entry.time}s`;
                    list.appendChild(li);
                });
            }
            container.hidden = false;
            loading.hidden = true
        })
        .catch(err => console.error(err));
}
function submitScore(name, mode, time) {
    fetch(`${renderUrl}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mode, score: 100, time })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            fetchLeaderboard(mode); // refresh leaderboard after submitting
        } else {
            console.log("Submit failed:", data.reason);
        }
    })
    .catch(err => console.error(err));
}