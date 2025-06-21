const PREFIX = window.location.hostname.includes("github.io") ? "/my-spotify-clone/" : "/";


let currentsong = new Audio ();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"; // Return a default value for invalid input
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`${PREFIX}${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
       const element = as[index];
       if(element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1]);
       }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; //clear the previous songs
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert musiclogo" src="./img/music-note-03-stroke-standard.svg" alt="music-note-03" width="32" height="32">
                            <div class="info">

                                <div>${song.replaceAll("%20", " ")}</div>
                        
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="./img/play-stroke-standard.svg" alt="play" width="32" height="32">
                            </div>
                        </li>`;
    }

    //attch eventlistener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
        playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs
   
}

const playmusic = (track, pause=false) => {
    currentsong.src = `${PREFIX}${currfolder}/` + track;
    if(!pause){
        currentsong.play();
        play.src = "./img/pause-stroke-standard.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
    let a = await fetch(`${PREFIX}songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0];
            // get the meatdata of the folder
            let a = await fetch(`${PREFIX}songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">

                        <div class="play" style="width: 60px; height: 60px;">
                            <svg viewBox="0 0 24 24" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#1fdf64"/>
                                <polygon points="10,8 16,12 10,16" fill="black"/>
                            </svg>
                        </div>

                        <img aria-hidden="false" draggable="false" loading="eager" src="./songs/${folder}/cover.jpg" alt="photo" class="mMx2LUixlnN_Fu45JpFB CmkY1Ag0tJDfnFXbGgju _EShSNaBK1wUIaZQFJJQ Yn2Ei5QZn19gria6LjZj" sizes="(min-width: 1280px) 232px, 192px">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }   

    // load the playlist whenever the card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item=>{
        songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
        playmusic(songs[0])
        })
    })
}

async function main(){

   // get the list of songs
    await getsongs("songs/cs")
    if(songs.length > 0){
        playmusic(songs[0], true); //play the first song by default
    }

    //display the albums
    displayalbums();

    //attach event listener to play next and previous button

    play.addEventListener("click", () => {
        if(currentsong.paused){
            currentsong.play();
            play.src = "./img/pause-stroke-standard.svg";
        }else{
            currentsong.pause();
            play.src = "./img/play-stroke-standard.svg";
        }
    });

    //listen to time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentsong.currentTime / currentsong.duration) * 100}%`;
    });

    //add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // const seekbar = e.currentTarget;
        // const clickX = e.clientX - seekbar.getBoundingClientRect().left;
        // const newTime = (clickX / seekbar.offsetWidth) * currentsong.duration;
        // currentsong.currentTime = newTime;
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentsong.currentTime = ((currentsong.duration) * percent / 100);
    });

    //add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener for close button

    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listener for previous button
    previous.addEventListener("click", () => {
      console.log("previous clicked");
       let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if((index-1) >= 0){
            playmusic(songs[index+1]);
        }
       
      
    });

    // add an event listener for next button
    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if((index+1) < songs.length){
            playmusic(songs[index+1]);
        }
       
    });

    // add an event to volume 

    document.querySelector(".volume input").addEventListener("input", (e) => {
    const volume = parseInt(e.target.value);
    console.log("setting volume to", volume, "/ 100");

    currentsong.volume = volume / 100;

    // If volume > 0, switch to high-volume icon
    if (volume > 0) {
        document.querySelector(".volume > img").src = "./img/volume-high-stroke-standard.svg";
    } else {
        document.querySelector(".volume > img").src = "./img/volume-mute-02-stroke-standard.svg";
    }
    });


    // add event listener to mute the track

    document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume-high-stroke-standard.svg")) {
        e.target.src = "./img/volume-mute-02-stroke-standard.svg";
        currentsong.volume = 0;
        document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
    } else {
        e.target.src = "./img/volume-high-stroke-standard.svg";
        currentsong.volume = 0.1;
        document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
    }
    });


}
main()