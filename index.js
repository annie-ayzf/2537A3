function setup() {

  let firstCard = undefined
  let secondCard = undefined

  //user can click when false, ignore when true
  let lockBoard = false;

  //default easy
  let selectedDifficulty = "easy"

  //difficulty setting
  const difficultySettings = {
    easy: {
      pairs: 3,
      totalTime: 100,
      columns: 3
    },
    medium: {
      pairs: 6,
      totalTime: 200,
      columns: 4
    },
    hard: {
      pairs: 12,
      totalTime: 300,
      columns: 6
    }
  }

  //power up
  let powerUpUsed = false

  //header variables
  let totalPairs = 3
  let matchedPairs = 0
  let pairsLeft = 3
  let clicks = 0
  let totalTime = 100
  let timeLeft = totalTime
  let gameEnded = false
  let timer = undefined

  //takes vars and put them into html spans
  function updateStatus() {
    $("#total_pairs").text(totalPairs)
    $("#matches").text(matchedPairs)
    $("#pairs_left").text(pairsLeft)
    $("#clicks").text(clicks)
    $("#total_time").text(totalTime)
    $("#time_left").text(timeLeft)
  }

  //changes difficulty settings
  function applyDifficulty() {
    let settings = difficultySettings[selectedDifficulty]

    totalPairs = settings.pairs
    matchedPairs = 0
    pairsLeft = settings.pairs
    clicks = 0
    totalTime = settings.totalTime
    timeLeft = totalTime

    $("#game_grid").css("grid-template-columns", `repeat(${settings.columns}, 1fr)`)

    updateStatus()
  }

  //randomizes the card order
  function shuffleCards(cards) {
    cards.sort(() => Math.random() - 0.5)
  }

  //pick random pokemon ids rom 1 to 1025
  //the same id is not picked twice
  //get the offical artwork image
  //return the number of unique pokemon needed
  async function getPokemonImages(numberOfPairs) {
    let pokemonImages = []
    let usedIds = []

    while (pokemonImages.length < numberOfPairs) {
      let randomId = Math.floor(Math.random() * 1025) + 1

      if (usedIds.includes(randomId)) {
        continue
      }

      usedIds.push(randomId)

      let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      let data = await response.json()

      let image = data.sprites.other["official-artwork"].front_default

      if (image) {
        pokemonImages.push(image)
      }
    }

    return pokemonImages
  }

  //creates the cards
  async function createCards() {
    $("#game_grid").empty()

    let cards = []

    let pokemonImages = await getPokemonImages(totalPairs)

    for (let i = 0; i < pokemonImages.length; i++) {
      cards.push(pokemonImages[i])
      cards.push(pokemonImages[i])
    }

    shuffleCards(cards)

    for (let i = 0; i < cards.length; i++) {
      $("#game_grid").append(`
          <div class="card">
            <img id="img${i}" class="front_face" src="${cards[i]}" alt="">
            <img class="back_face" src="back.webp" alt="">
          </div>
        `)
    }
  }

  //default menu screen
  function showMenuScreen() {
    clearInterval(timer)

    selectedDifficulty = "easy"
    applyDifficulty()

    gameEnded = true
    lockBoard = true
    firstCard = undefined
    secondCard = undefined

    $(".card").removeClass("flip matched")


    $(".difficulty_btn").removeClass("selected")
    $("#easy_btn").addClass("selected")

    $("#start_btn").show()
    $("#reset_btn").show()

    $("#status_header").hide()
    $("#game_grid").hide()
    $("#message").text("")

    $("#theme_controls").hide()

    $("#powerup_btn").hide()

    $(".card").removeClass("flip matched")

    updateStatus()
  }

  //start the game
  async function showGameScreen() {
    clearInterval(timer)
    applyDifficulty()
    powerUpUsed = false
    $("#powerup_btn").show()
    await createCards()

    gameEnded = false
    lockBoard = false

    $("#start_btn").hide()
    $("#reset_btn").show()

    $("#status_header").show()
    $("#game_grid").show()

    $("#theme_controls").show()

    updateStatus()
    startTimer()
  }

  //timer counts down by 1 second
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--
      updateStatus()

      if (timeLeft <= 0) {
        clearInterval(timer)
        gameEnded = true
        $("#message").text("Game Over!")
        alert("Game Over!")
      }
    }, 1000)
  }

  $("#game_grid").on("click", ".card", function () {
    //dont click when 2 cards are being checked
    if (lockBoard) {
      return;
    }

    //doesnt click the same card twice
    if ($(this).hasClass("flip")) {
      return;
    }

    //stop click when the cards are matched
    if ($(this).hasClass("matched")) {
      return;
    }

    if (gameEnded) {
      return;
    }

    //updates the header status
    clicks++
    updateStatus()

    $(this).toggleClass("flip");

    if (!firstCard)
      firstCard = $(this).find(".front_face")[0]
    else {
      secondCard = $(this).find(".front_face")[0]
      console.log(firstCard, secondCard);

      if (firstCard.src == secondCard.src) {
        console.log("match")

        //updates the header status
        matchedPairs++
        pairsLeft--
        updateStatus()

        //if the user wins, pop up you win message
        if (matchedPairs == totalPairs) {
          clearInterval(timer)
          gameEnded = true;
          
          
          setTimeout(() => {
            $("#message").text("You Win!")
            alert("You Win!")
          }, 1000)
          
        }

        //keeps the cards flipped and flagging for matched
        $(`#${firstCard.id}`).parent().addClass("matched")
        $(`#${secondCard.id}`).parent().addClass("matched")

        firstCard = undefined;
        secondCard = undefined;
      } else {
        console.log("no match")
        lockBoard = true;

        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip")
          $(`#${secondCard.id}`).parent().toggleClass("flip")

          firstCard = undefined;
          secondCard = undefined;

          lockBoard = false;
        }, 1000)
      }
    }
  });

  //easy button
  $("#easy_btn").on("click", function () {
    selectedDifficulty = "easy"

    $(".difficulty_btn").removeClass("selected")
    $("#easy_btn").addClass("selected")

    applyDifficulty()
  })

  //medium button
  $("#medium_btn").on("click", function () {
    selectedDifficulty = "medium"

    $(".difficulty_btn").removeClass("selected")
    $("#medium_btn").addClass("selected")

    applyDifficulty()
  })

  //hard button
  $("#hard_btn").on("click", function () {
    selectedDifficulty = "hard"

    $(".difficulty_btn").removeClass("selected")
    $("#hard_btn").addClass("selected")

    applyDifficulty()
  })

  //start button
  $("#start_btn").on("click", function () {
    showGameScreen()
  })

  //reset button
  $("#reset_btn").on("click", function () {
    showMenuScreen()
  })

  //dark theme button
  $("#dark_btn").on("click", function () {
    $("#game_grid").removeClass("light_theme")
    $("#game_grid").addClass("dark_theme")
  })

  //light theme button
  $("#light_btn").on("click", function () {
    $("#game_grid").removeClass("dark_theme")
    $("#game_grid").addClass("light_theme")
  })

  //power up button
  $("#powerup_btn").on("click", function () {
    if (gameEnded) {
      return
    }

    if (powerUpUsed) {
      return
    }

    powerUpUsed = true
    lockBoard = true

    $(".card").not(".matched").addClass("flip")
    $("#powerup_btn").hide()

    setTimeout(() => {
      $(".card").not(".matched").removeClass("flip")
      firstCard = undefined
      secondCard = undefined
      lockBoard = false
    }, 3000)
  })

  showMenuScreen()
}

$(document).ready(setup)