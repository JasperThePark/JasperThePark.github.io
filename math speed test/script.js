const buttons = document.querySelectorAll(".mode-button");
const quizArea = document.getElementById("quizArea");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        startQuiz(mode);
    });
});

function startQuiz(mode) {
    quizArea.hidden = false;

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
    mistakesList.innerHTML = ''
    answerBox.hidden = true;
    cancelQuiz.hidden = true;
    label.hidden = true;
    question.textContent = '';
    countdownDisplay.textContent = '';

    const newAnswerBox = answerBox.cloneNode(true);
    answerBox.parentNode.replaceChild(newAnswerBox, answerBox);
    console.log('Quiz Starts!')

    
    let countdownValue = 2;
    countdownDisplay.textContent = 3;
    
    const countdownInterval = setInterval(()=>{
        if(countdownValue == 0){
            countdownDisplay.textContent = 'Go!';
        }
        else if(countdownValue==-1){
            countdownDisplay.textContent = '';
            clearInterval(countdownInterval);
            startQuiz1()
        }
        else{
            countdownDisplay.textContent = countdownValue
        }
        countdownValue-=1
    },1000);

    cancelQuiz.onclick = () => {
        clearInterval(countdownInterval);
        const freshBox = newAnswerBox.cloneNode(true);
        newAnswerBox.parentNode.replaceChild(freshBox, newAnswerBox);
        quizArea.hidden = true;
        mistakesList.innerHTML = ''
    };

    function startQuiz1(){
        newAnswerBox.value = ''
        cancelQuiz.hidden = false
        newAnswerBox.hidden= false
        label.hidden = false
        question.hidden = false
        nextQuestion()    
    };

    function nextQuestion(){
        if(currentQuestion>=totalQuestions){
            question.textContent = 'Quiz Over! Score: '+score*10;
            newAnswerBox.hidden = true;
            label.hidden = true;
            mistakesList.hidden = false
            mistakesList.innerHTML = '';
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
    countdownDisplay.textContent = '';

    const newAnswerBox = answerBox.cloneNode(true);
    answerBox.parentNode.replaceChild(newAnswerBox, answerBox);
    console.log('Quiz Starts!')

    
    let countdownValue = 2;
    countdownDisplay.textContent = 3;
    
    const countdownInterval = setInterval(()=>{
        if(countdownValue == 0){
            countdownDisplay.textContent = 'Go!';
        }
        else if(countdownValue==-1){
            countdownDisplay.textContent = '';
            clearInterval(countdownInterval);
            startQuiz1()
        }
        else{
            countdownDisplay.textContent = countdownValue
        }
        countdownValue-=1
    },1000);

    cancelQuiz.onclick = () => {
        clearInterval(countdownInterval);
        const freshBox = newAnswerBox.cloneNode(true);
        newAnswerBox.parentNode.replaceChild(freshBox, newAnswerBox);
        quizArea.hidden = true;
        mistakesList.innerHTML = ''
    };

    function startQuiz1(){
        newAnswerBox.value = ''
        cancelQuiz.hidden = false
        newAnswerBox.hidden= false
        label.hidden = false
        question.hidden = false
        nextQuestion()    
    };

    function nextQuestion(){
        if(currentQuestion>=totalQuestions){
            question.textContent = 'Quiz Over! Score: '+score*10;
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
    }
}

function generateProbabilityQuestion() {
    const ops = ['*', '+', '-', '/'];
    const question = document.getElementById("question")
    const answerBox = document.getElementById('answerBox')
    const label = document.getElementById('label')
    const cancelQuiz = document.getElementById('cancel')
    const countdownDisplay = document.getElementById('countdown')
    const totalQuestions = 10
    let score = 0;
    let currentQuestion = 0;
    let n,k,split;
    answerBox.hidden = true;
    cancelQuiz.hidden = true;
    label.hidden = true;
    question.textContent = '';
    countdownDisplay.textContent = '';

    const newAnswerBox = answerBox.cloneNode(true);
    answerBox.parentNode.replaceChild(newAnswerBox, answerBox);
    console.log('Quiz Starts!')

    
    let countdownValue = 2;
    countdownDisplay.textContent = 3;
    
    const countdownInterval = setInterval(()=>{
        if(countdownValue == 0){
            countdownDisplay.textContent = 'Go!';
        }
        else if(countdownValue==-1){
            countdownDisplay.textContent = '';
            clearInterval(countdownInterval);
            startQuiz1()
        }
        else{
            countdownDisplay.textContent = countdownValue
        }
        countdownValue-=1
    },1000);

    cancelQuiz.onclick = () => {
        clearInterval(countdownInterval);
        const freshBox = newAnswerBox.cloneNode(true);
        newAnswerBox.parentNode.replaceChild(freshBox, newAnswerBox);
        quizArea.hidden = true;
    };

    function startQuiz1(){
        newAnswerBox.value = ''
        cancelQuiz.hidden = false
        newAnswerBox.hidden= false
        label.hidden = false
        question.hidden = false
        nextQuestion()    
    };

    function nextQuestion(){
        if(currentQuestion >= totalQuestions){
            question.textContent = 'Quiz Over! Score: ' + score*10;
            newAnswerBox.hidden = true
            label.hidden = true
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
            question.textContent = templates[Math.floor(Math.random() * templates.length)];

        } else if(split == 1){
            // combinations
            k = Math.ceil(Math.random() * 3) + 1;
            n = k + Math.ceil(Math.random() * 4);
            const templates = [
                `How many ways can you choose ${k} students out of ${n}?`,
                `A bag has ${n} different marbles. How many ways to pick ${k}?`,
                `There are ${n} clubs and you can join ${k}. How many sets can you choose?`
            ];
            question.textContent = templates[Math.floor(Math.random() * templates.length)];

        } else {
            // probability from counting
            let outcomes = Math.floor(Math.random() * 6) + 6;
            let favorable = Math.floor(Math.random() * outcomes);
            question.textContent =
                `If a random event has ${favorable} favorable outcomes out of ${outcomes} equally likely outcomes,\n` +
                `what is the probability? (Answer as a simplified fraction or decimal)`;
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


    function checkAnswer(){
        let correct;

        if(split == 0){
            correct = factorial(n) / factorial(n - k); // permutations
        } else if(split == 1){
            correct = factorial(n) / (factorial(n-k)*factorial(k))
        } else {
            correct = k / n; // probability
        }
        let user;
        if(newAnswerBox.value.includes('/')){
            let arr = newAnswerBox.value.split('/')
            user = Number(arr[0])/Number(arr[1])
        }
        user = Number(newAnswerBox.value);
        
        if (Math.abs(user - correct) < 0.0001){
            score++;
            console.log("correct");
        } else {
            console.log("incorrect");
        }

        newAnswerBox.value = "";
        nextQuestion();
    }
}
