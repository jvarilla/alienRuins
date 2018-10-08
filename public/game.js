/*Joseph Varilla
Date: 4/28/18
App: Archaeology
Description: User tries to uncover all ruins
User will get a 10 point bonus for uncovering two ruins in a row
*/
// Demo code for the Archaeology game
//
// Loaded by game.html
// Uses GameBoard object defined in board.js
//

// Warning! The function tryDig and the variable board are global variables!

var tryDig, targetObj, diggedCells, totalClicks, totalSuccesfulClicks,
    userScore, diggedObjs, digAllCells, numExcavatedRuins;
//var hasWon;
$(function () {
  //Initialize the Game
  board = new GameBoard();
  board.setBoard();
  userScore = 0;
  hasWon = false;
  totalClicks = 0;
  totalSuccesfulClicks = 0;
  numExcavatedRuins = 0;
  diggedObjs = [];
  diggedCells = [];
  $("#pcBtn").text("Start");
  //Define Initial Functions
  var resetGame = function() {
    $("#board").html("");
    board = new GameBoard();
    board.setBoard();
    userScore = 0;
    totalClicks = 0;
    totalSuccesfulClicks = 0;
    numExcavatedRuins = 0;
    diggedObjs = [];
    diggedCells = [];
    $("#playAgainBtn").hide();
  };
  resetGame();

  var dspRuinList = function(ruinList){
    $("#ruinListDsp").html("");
    for (ruinIdx = 0; ruinIdx < ruinList.length; ruinIdx++) {
      //Count How Many Of The Ruins There Are and make checkmark string
      var foundCountStr = "";
      for (piecesIdx = 0; piecesIdx< ruinList[ruinIdx].successes; piecesIdx++) {
        foundCountStr += "✓ ";
      }
      for (missingPiecesIdx = 0; missingPiecesIdx < (ruinList[ruinIdx].size) -(ruinList[ruinIdx].successes); missingPiecesIdx++) {//); missingPiecesIdx++) {
        foundCountStr += "• ";
      }
      $("#ruinListDsp").append("<div class='ruinListItem'>" +
      ruinList[ruinIdx].name + "<span style='align:center;'> " + foundCountStr + "</span></div>");
      //Set Color to match ruin
      $( "#ruinListDsp .ruinListItem:nth-child(" + (ruinIdx + 1) + ")").css("background-color", ruinList[ruinIdx].primaryColor );
    }
  }

  var increaseClicks = function() {
    totalClicks++;
    $("#totalClicksDsp").html(totalClicks);
  }

  var increaseSuccessfulClicks = function() {
    totalSuccesfulClicks++;
    $("#successfulClicksDsp").html(totalSuccesfulClicks);
  }
  var changeScore = function(amount) {
    //Score Formula
    userScore += amount;
    $("#scoreDsp").html(userScore);
    checkIfWonTheGame()
  }

  var evaluateDigRate = function(successes, total) {
    //Determine Level of Digging Skills
    var digLevel;
    var successRate = ((successes / total) * 100);
    if (successRate > 90) {
      digLevel = "Master";
    } else if (successRate > 75){
      digLevel = "Expert";
    } else if (successRate > 49) {
      digLevel = "Pro";
    } else if (successRate > 20) {
      digLevel = "Amatuer";
    } else {
      digLevel = "Novice";
    }
    successRate = successRate.toFixed(2) + "%";
    return {success: successes, totalClicks: total, rate: successRate, digTitle: digLevel};
  }
  var handleWonGame = function() {
    $("#pcBtn").text("Close");
    $("#digResponse").html("You Have Won The Game!!!");
    $(".modalContent").html("");
    $(".modal").css("display", "block");
    resultObj = evaluateDigRate(totalSuccesfulClicks, totalClicks);
    recordScore(resultObj);
    $(".modalContent").append("<h1>You Won!!!</h1><h2>Out of " +
    resultObj.totalClicks + " total clicks, you had " + resultObj.success +
    " successful clicks.</h2><h2> Your success rate is " +  resultObj.rate +
    ". <h2>Your archeologist level is: </h2><h2>" + resultObj.digTitle + "</h2><h2>Your Final score"
  + " is: <br>" + userScore + "</h2><br>");
    $("#playAgainBtn").show();
  }

  const recordScore = (result) => {
    $.ajax({
            type: 'POST',
            data: JSON.stringify(result),
                contentType: 'application/json',
                        url: 'http://localhost:3000/recordscore',            
                        success: function(data) {
                            console.log('success');
                            console.log(JSON.stringify(data));
                        }
                    });
  }

  var checkIfWonTheGame = function() {
    var matchCount;
    for (i =0; i<board.ruins.length; i++) {
      matchCount = 0;
      for(j = 0; j < diggedObjs.length; j++) {
        if (board.ruins[i] == diggedObjs[j]) {
         matchCount++;
       }
      }
      if (matchCount != board.ruins[i].size) {
        return;
      }
    }
    hasWon = true;
    handleWonGame();
  }

  var countExcavatedRuins = function(){
    var objCount;
    numExcavatedRuins = 0;
    for (i = 0; i < board.ruins.length; i++) {
      objCount = 0;
      for (j =0; j < diggedObjs.length; j++) {
        if (board.ruins[i] == diggedObjs[j]) {
          objCount++;
        }
      }
      if (objCount == board.ruins[i].size) {
        numExcavatedRuins++;
      }
    }
    $("#ruinsUncoveredDsp").html(numExcavatedRuins);
  }


  tryDig = function(targetCell)
  {
    $("#digResponse").css('color', 'white');
    $("#digResponse").css('font-weight', 'normal');
    targetObj = board.dig(targetCell);
    if ($.inArray(targetCell, diggedCells) != -1) {
      $("#digResponse").html("You have dug this spot already.");
    }
    else if (targetObj) {
        increaseClicks();
        $("#cell"+targetCell).html("<img src='sand3.png'/>");
        $("#digResponse").html('Digging.');
        setTimeout(function() {
          $("#digResponse").html('Digging..');
          $("#cell"+targetCell).html("<img src='sand4.png'/>");
          setTimeout(function() {
            $("#digResponse").html('Digging...');
            $("#cell"+targetCell).html("<img src='" + targetObj.displayImg + "'/>");
            $("#cell"+targetCell).css('color', 'red');
            $("#digResponse").css('color', targetObj.secondaryColor);
            $("#digResponse").css('font-weight', 'bold');
            $("#digResponse").html('Success finding the ' + targetObj.name);
            diggedCells.push(targetCell);
            diggedObjs.push(targetObj);
            dspRuinList(board.ruins);
            increaseSuccessfulClicks();
            changeScore(5);
            countExcavatedRuins();
            if (diggedObjs[diggedObjs.length-2] != "") {
              setTimeout(function(){
                $("#digResponse").html("Double Find Bonus + 10pts");
                changeScore(10);
              }, 200)
            }
          }, 200);
        }, 200)
    }
    else {
      increaseClicks();
      $("#digResponse").html('Digging.');
      $("#cell"+targetCell).html("<img src='sand3.png'/>");
      setTimeout(function() {
        $("#digResponse").html('Digging..');
        $("#cell"+targetCell).html("<img src='sand4.png'/>");
        setTimeout(function() {
          $("#digResponse").html('Digging...');
          $("#digResponse").html('There is nothing there... :(');
          $("#cell"+targetCell).html("<img src='land.png'/>");
          diggedCells.push(targetCell);
          diggedObjs.push("");
          changeScore(-1);
        }, 200);
      }, 200)
    }
  }

  //Digs whole board, for automated testing purposes
  /*digAllCells = function() {
    var time = 3000;
    $(".square").each(function(i, element){
      setTimeout(function() {
        tryDig($(element).attr("id").replace("cell", ""));
      }, time);
      time+=3000;

    })
  }*/

  dspInstructions = function() {
    $(".modal").css("display", "block");
    $(".modalContent").html("<h1>Instructions</h1><h3>You are an archeologist,"
    + " exacavating the site of ancient aliens. </h3> <h3>Your goal is to "
    + "uncover all of the aliens' high tech ruins. </h3> <h3>"
    + "You have information on how many of each ruin there are from historical "
    + "reports. </h3><h3>Click a plot of land to start digging.</h3>")
  }

  dspInstructions();
  //Set Panel
  dspRuinList(board.ruins);


  $(".resetGameBtn").click(function(){//Resets Game
    location.reload();
  });

  $("#playAgainBtn").click(function(){//Resets Game
    location.reload();
  });

  $("#dspInstructionsBtn").click(function(){
    dspInstructions();
  })
  $(".square").click(function(){
    tryDig($(this).attr("id").replace("cell", ""));
  })

  $("#modalClose").click(function(){
    $(".modal").css("display", "none");
  })
  //Handle Modal Close
  /*$(".modal").click(function() {
    if (!hasWon) {
      $(this).css("display", "none");
    }
  })*/



});
