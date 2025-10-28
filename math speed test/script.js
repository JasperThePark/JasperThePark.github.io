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
    let op,nums1,nums2,num3;
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
        if(currentQuestion>=totalQuestions){
            question.textContent = 'Quiz Over! Score: '+score*10;
            newAnswerBox.hidden = true
            label.hidden = true
            return;
        }
        nums1 = Math.floor(Math.random()*100)
        nums2 = Math.floor(Math.random()*100)
        op = ops[Math.floor(Math.random() * ops.length)];

        question.textContent = nums1+op+nums2
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
            return;
        }
        split = Math.floor(Math.random()*2)
        if(split == 0){
            //linear algebra
            nums1 = Math.floor(Math.random()*100)
            nums2 = Math.floor(Math.random()*100)
            op = ops[Math.floor(Math.random() * ops.length)];

            question.textContent = 'x'+op+nums1+'='+nums2+'   x = ?'
        }else{
            //quadratic algebra
            nums1 = Math.floor(Math.random()*100)
            nums2 = Math.floor(Math.random()*100)
            nums3 = Math.ceil(Math.random()*2)
            op = ops[Math.floor(Math.random() * ops.length)];

            question.textContent = nums3+'x^2 + '+nums2+'x + '+nums1+' = 0   x = ?'
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
            console.log('incorrect')
        }
        newAnswerBox.value = "";
        nextQuestion();
    }
}

function generateProbabilityQuestion() {
    // your 3 subtypes here
}
