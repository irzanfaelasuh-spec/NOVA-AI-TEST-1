/* =========================================================
   NOVA AI X
   FULL GEMINI FRONTEND
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

  tokens:1024,

  temperature:0.70,

  topP:0.95,

  systemPrompt:
    "You are NOVA AI X, a helpful, intelligent and friendly AI assistant. Explain difficult things simply and clearly. Remember the conversation context and give useful answers.",

  remember:true,

  typing:true,

  sound:false,

  glow:true,

  compact:false

};


/* =========================================================
   SAFE JSON
========================================================= */

function safeJSON(
  value,
  fallback
){

  try{

    return JSON.parse(value);

  }catch{

    return fallback;

  }

}


/* =========================================================
   STATE
========================================================= */

const state = {

  apiKey:
    localStorage.getItem(
      "nova_api_key"
    ) || "",


  model:
    localStorage.getItem(
      "nova_model"
    ) || "",


  chats:
    safeJSON(
      localStorage.getItem(
        "nova_chats"
      ),
      []
    ),


  current:null,


  settings:{
    ...DEFAULT_SETTINGS,

    ...safeJSON(
      localStorage.getItem(
        "nova_settings"
      ),
      {}
    )

  }

};


let busy = false;


/* =========================================================
   SAVE
========================================================= */

function saveState(){

  if(
    state.settings.remember
  ){

    localStorage.setItem(
      "nova_chats",
      JSON.stringify(
        state.chats
      )
    );

  }


  localStorage.setItem(
    "nova_settings",
    JSON.stringify(
      state.settings
    )
  );


  if(state.apiKey){

    localStorage.setItem(
      "nova_api_key",
      state.apiKey
    );

  }


  if(state.model){

    localStorage.setItem(
      "nova_model",
      state.model
    );

  }

}


/* =========================================================
   TOAST
========================================================= */

function toast(message){

  const element =
    $("#toast");

  if(!element){
    return;
  }


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  clearTimeout(
    toast.timer
  );


  toast.timer =
    setTimeout(()=>{

      element.classList.remove(
        "show"
      );

    },1800);

}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings(){

  $("#settingsPanel")
    .classList.add(
      "open"
    );


  $("#overlay")
    .classList.add(
      "show"
    );

}


function closeSettings(){

  $("#settingsPanel")
    .classList.remove(
      "open"
    );


  $("#overlay")
    .classList.remove(
      "show"
    );

}


$("#openSettings")
  .addEventListener(
    "click",
    openSettings
  );


$("#settingsBtn")
  .addEventListener(
    "click",
    openSettings
  );


$("#closeSettings")
  .addEventListener(
    "click",
    closeSettings
  );


$("#overlay")
  .addEventListener(
    "click",
    closeSettings
  );


/* =========================================================
   MOBILE MENU
========================================================= */

$("#mobileMenu")
  .addEventListener(
    "click",
    ()=>{

      $("#sidebar")
        .classList.toggle(
          "open"
        );

    }
  );


/* =========================================================
   FULLSCREEN
========================================================= */

$("#focusBtn")
  .addEventListener(
    "click",
    async ()=>{

      try{

        if(
          !document.fullscreenElement
        ){

          await document
            .documentElement
            .requestFullscreen();

        }else{

          await document
            .exitFullscreen();

        }

      }catch{

        toast(
          "Fullscreen unavailable"
        );

      }

    }
  );


/* =========================================================
   CREATE CHAT
========================================================= */

function createNewChat(){

  state.current = {

    id:
      crypto.randomUUID(),

    title:
      "New conversation",

    messages:[]

  };


  state.chats.unshift(
    state.current
  );


  saveState();

  renderHistory();

  renderMessages();

  $("#sidebar")
    .classList.remove(
      "open"
    );

  $("#prompt")
    .focus();

}


/* =========================================================
   NEW CHAT BUTTON
========================================================= */

$("#newChat")
  .addEventListener(
    "click",
    createNewChat
  );


/* =========================================================
   CLEAR HISTORY
========================================================= */

$("#clearHistory")
  .addEventListener(
    "click",
    ()=>{

      state.chats = [];


      state.current = {

        id:
          crypto.randomUUID(),

        title:
          "New conversation",

        messages:[]

      };


      state.chats.push(
        state.current
      );


      saveState();

      renderHistory();

      renderMessages();

      toast(
        "Chat history cleared"
      );

    }
  );


/* =========================================================
   HISTORY
========================================================= */

function renderHistory(){

  const container =
    $("#history");


  container.innerHTML =
    "";


  state.chats
    .slice(0,50)
    .forEach(
      chat => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "history-item";


        if(
          state.current &&
          state.current.id === chat.id
        ){

          button.classList.add(
            "active"
          );

        }


        button.textContent =
          chat.title ||
          "New conversation";


        button.addEventListener(
          "click",
          ()=>{

            state.current =
              chat;

            renderHistory();

            renderMessages();

            $("#sidebar")
              .classList.remove(
                "open"
              );

          }
        );


        container.appendChild(
          button
        );

      }
    );

}


/* =========================================================
   ESCAPE
========================================================= */

function escapeHTML(text){

  return text.replace(
    /[&<>"']/g,
    character => {

      const map = {

        "&":"&amp;",

        "<":"&lt;",

        ">":"&gt;",

        '"':"&quot;",

        "'":"&#039;"

      };


      return map[
        character
      ];

    }
  );

}


/* =========================================================
   FORMAT AI RESPONSE
========================================================= */

function formatText(text){

  let output =
    escapeHTML(
      text
    );


  output =
    output.replace(
      /```([\s\S]*?)```/g,
      "<pre>$1</pre>"
    );


  output =
    output.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );


  output =
    output.replace(
      /\n/g,
      "<br>"
    );


  return output;

}


/* =========================================================
   RENDER CHAT
========================================================= */

function renderMessages(){

  const container =
    $("#messages");


  container.innerHTML =
    "";


  if(
    !state.current
  ){

    $("#welcome")
      .style.display =
      "block";

    return;

  }


  if(
    state.current.messages.length
  ){

    $("#welcome")
      .style.display =
      "none";

  }else{

    $("#welcome")
      .style.display =
      "block";

  }


  state.current.messages
    .forEach(
      message => {

        addMessage(
          message.role,
          message.text,
          false
        );

      }
    );


  scrollBottom();

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
  role,
  text,
  scroll=true
){

  const container =
    $("#messages");


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "message " +
    (
      role === "user"
        ? "user"
        : "ai"
    );


  const bubbleWrap =
    document.createElement(
      "div"
    );


  bubbleWrap.className =
    "bubble-wrap";


  const label =
    document.createElement(
      "div"
    );


  label.className =
    "label";


  label.textContent =
    role === "user"
      ? "YOU"
      : "AI";


  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    "bubble";


  bubble.innerHTML =
    formatText(
      text
    );


  bubbleWrap.append(
    label,
    bubble
  );


  wrapper.appendChild(
    bubbleWrap
  );


  container.appendChild(
    wrapper
  );


  if(scroll){

    scrollBottom();

  }


  return bubble;

}


/* =========================================================
   TYPING
========================================================= */

function createTypingBubble(){

  const bubble =
    addMessage(
      "assistant",
      "",
      true
    );


  bubble.innerHTML = `

    <div class="typing">

      <i></i>
      <i></i>
      <i></i>

    </div>

  `;


  return bubble;

}


/* =========================================================
   SCROLL
========================================================= */

function scrollBottom(){

  const chat =
    $("#chat");


  requestAnimationFrame(
    ()=>{

      chat.scrollTop =
        chat.scrollHeight;

    }
  );

}


/* =========================================================
   RANDOM GEMINI MODEL
========================================================= */

async function findRandomModel(){

  if(!state.apiKey){

    throw new Error(
      "Please add your Gemini API key first."
    );

  }


  const response =
    await fetch(

      "https://generativelanguage.googleapis.com/v1beta/models?key=" +
      encodeURIComponent(
        state.apiKey
      )

    );


  if(!response.ok){

    let errorText =
      "Could not access Gemini models.";


    try{

      const error =
        await response.json();


      errorText =
        error?.error?.message ||
        errorText;

    }catch{}


    throw new Error(
      errorText
    );

  }


  const data =
    await response.json();


  const models =
    (data.models || [])
      .filter(
        model => {

          const methods =
            model.supportedGenerationMethods ||
            [];


          return (

            methods.includes(
              "generateContent"
            )

            &&

            !/embedding|tts|image|audio|transcribe|live/i
              .test(
                model.name || ""
              )

          );

        }
      );


  if(!models.length){

    throw new Error(
      "No compatible text model found."
    );

  }


  const selected =
    models[
      Math.floor(
        Math.random() *
        models.length
      )
    ];


  state.model =
    (
      selected.name || ""
    ).replace(
      /^models\//,
      ""
    );


  $("#modelName")
    .textContent =
      selected.displayName ||
      state.model;


  $("#selectedModel")
    .textContent =
      state.model;


  saveState();


  return state.model;

}


/* =========================================================
   ENSURE MODEL
========================================================= */

async function ensureModel(){

  if(
    state.model
  ){

    return state.model;

  }


  return await findRandomModel();

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(text){

  text =
    String(text || "")
      .trim();


  if(
    !text ||
    busy
  ){

    return;

  }


  if(!state.apiKey){

    openSettings();

    toast(
      "Add your Gemini API key first."
    );

    return;

  }


  busy = true;


  $("#sendBtn")
    .disabled =
    true;


  $("#prompt")
    .value =
    "";


  $("#prompt")
    .style.height =
    "auto";


  if(!state.current){

    createNewChat();

  }


  const chat =
    state.current;


  chat.messages.push({

    role:"user",

    text:text

  });


  if(
    chat.messages.length === 1
  ){

    chat.title =
      text
        .replace(
          /\s+/g,
          " "
        )
        .slice(
          0,
          45
        );

  }


  saveState();

  renderHistory();

  $("#welcome")
    .style.display =
    "none";


  addMessage(
    "user",
    text
  );


  const typing =
    createTypingBubble();


  try{

    const model =
      await ensureModel();


    const contents =
      chat.messages.map(
        message => ({

          role:
            message.role === "assistant"
              ? "model"
              : "user",

          parts:[
            {
              text:
                message.text
            }
          ]

        })
      );


    const body = {

      systemInstruction:{

        parts:[
          {
            text:
              state.settings
                .systemPrompt
          }
        ]

      },


      contents:


        contents,


      generationConfig:{

        maxOutputTokens:
          Number(
            state.settings
              .tokens
          ),

        temperature:
          Number(
            state.settings
              .temperature
          ),

        topP:
          Number(
            state.settings
              .topP
          )

      }

    };


    const response =
      await fetch(

        "https://generativelanguage.googleapis.com/v1beta/models/" +

        encodeURIComponent(
          model
        ) +

        ":generateContent?key=" +

        encodeURIComponent(
          state.apiKey
        ),

        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              body
            )

        }

      );


    const data =
      await response.json();


    if(!response.ok){

      throw new Error(
        data?.error?.message ||
        "Gemini request failed."
      );

    }


    const answer =
      (
        data
          ?.candidates?.[0]
          ?.content?.parts ||
        []
      )
      .map(
        part =>
          part.text || ""
      )
      .join("")
      .trim();


    if(!answer){

      throw new Error(
        "Gemini returned an empty response."
      );

    }


    const typingMessage =
      typing.closest(
        ".message"
      );


    if(
      typingMessage
    ){

      typingMessage.remove();

    }


    const answerBubble =
      addMessage(
        "assistant",
        "",
        true
      );


    if(
      state.settings.typing
    ){

      for(
        let i=0;
        i<answer.length;
        i++
      ){

        answerBubble.textContent +=
          answer[i];


        scrollBottom();


        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              Math.min(
                8,
                2500 /
                Math.max(
                  answer.length,
                  1
                )
              )
            )
        );

      }

    }else{

      answerBubble.innerHTML =
        formatText(
          answer
        );

    }


    chat.messages.push({

      role:"assistant",

      text:answer

    });


    saveState();


  }catch(error){

    const typingMessage =
      typing.closest(
        ".message"
      );


    if(
      typingMessage
    ){

      typingMessage.remove();

    }


    addMessage(
      "assistant",
      "⚠ " +
      error.message
    );


    toast(
      error.message
    );

  }


  busy = false;


  $("#sendBtn")
    .disabled =
    false;

}


/* =========================================================
   SEND BUTTON
========================================================= */

$("#sendBtn")
  .addEventListener(
    "click",
    ()=>{

      sendMessage(
        $("#prompt").value
      );

    }
  );


/* =========================================================
   ENTER
========================================================= */

$("#prompt")
  .addEventListener(
    "keydown",
    event => {

      if(
        event.key === "Enter" &&
        !event.shiftKey
      ){

        event.preventDefault();

        sendMessage(
          event.target.value
        );

      }

    }
  );


/* =========================================================
   TEXTAREA AUTO RESIZE
========================================================= */

$("#prompt")
  .addEventListener(
    "input",
    event => {

      event.target.style.height =
        "auto";


      event.target.style.height =
        Math.min(
          event.target.scrollHeight,
          150
        ) +
        "px";

    }
  );


/* =========================================================
   QUICK PROMPTS
========================================================= */

$$(".quick")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        ()=>{

          sendMessage(
            button.dataset.prompt
          );

        }
      );

    }
  );


/* =========================================================
   SAVE API KEY
========================================================= */

$("#saveKey")
  .addEventListener(
    "click",
    async ()=>{

      const key =
        $("#apiKey")
          .value
          .trim();


      if(!key){

        toast(
          "Enter your Gemini API key."
        );

        return;

      }


      state.apiKey =
        key;


      state.model =
        "";


      localStorage.removeItem(
        "nova_model"
      );


      $("#apiStatus")
        .textContent =
        "Connecting…";


      try{

        await findRandomModel();


        $("#apiStatus")
          .textContent =
          "Connected · random model selected";


        toast(
          "Gemini connected!"
        );


      }catch(error){

        $("#apiStatus")
          .textContent =
          error.message;


        toast(
          error.message
        );

      }

    }
  );


/* =========================================================
   RANDOM MODEL BUTTON
========================================================= */

$("#refreshModel")
  .addEventListener(
    "click",
    async ()=>{

      try{

        state.model =
          "";


        localStorage.removeItem(
          "nova_model"
        );


        await findRandomModel();


        $("#apiStatus")
          .textContent =
          "Connected · new random model selected";


        toast(
          "Random model changed!"
        );


      }catch(error){

        toast(
          error.message
        );

      }

    }
  );


/* =========================================================
   TOKEN
========================================================= */

$("#tokens")
  .addEventListener(
    "input",
    event => {

      state.settings.tokens =
        Number(
          event.target.value
        );


      $("#tokenValue")
        .textContent =
        event.target.value;


      saveState();

    }
  );


/* =========================================================
   TEMPERATURE
========================================================= */

$("#temperature")
  .addEventListener(
    "input",
    event => {

      state.settings.temperature =
        Number(
          event.target.value
        );


      $("#temperatureValue")
        .textContent =
        Number(
          event.target.value
        ).toFixed(2);


      saveState();

    }
  );


/* =========================================================
   TOP P
========================================================= */

$("#topP")
  .addEventListener(
    "input",
    event => {

      state.settings.topP =
        Number(
          event.target.value
        );


      $("#topPValue")
        .textContent =
        Number(
          event.target.value
        ).toFixed(2);


      saveState();

    }
  );


/* =========================================================
   SYSTEM PROMPT
========================================================= */

$("#systemPrompt")
  .addEventListener(
    "input",
    event => {

      state.settings.systemPrompt =
        event.target.value;


      saveState();

    }
  );


/* =========================================================
   SWITCHES
========================================================= */

[
  "remember",
  "typing",
  "sound",
  "glow",
  "compact"

].forEach(
  id => {

    $("#" + id)
      .addEventListener(
        "change",
        event => {

          state.settings[id] =
            event.target.checked;


          document.body
            .classList.toggle(
              "no-glow",
              !state.settings.glow
            );


          document.body
            .classList.toggle(
              "compact",
              state.settings.compact
            );


          saveState();

        }
      );

  }
);


/* =========================================================
   THEMES
========================================================= */

$$(".theme")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        ()=>{

          $$(".theme")
            .forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          const theme =
            button.dataset.theme;


          document.documentElement
            .dataset.theme =
            theme;


          localStorage.setItem(
            "nova_theme",
            theme
          );

        }
      );

    }
  );


/* =========================================================
   RESET SETTINGS
========================================================= */

$("#resetSettings")
  .addEventListener(
    "click",
    ()=>{

      state.settings =
        {
          ...DEFAULT_SETTINGS
        };


      saveState();

      loadSettings();

      toast(
        "Settings reset."
      );

    }
  );


/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings(){

  $("#apiKey")
    .value =
    state.apiKey;


  $("#tokens")
    .value =
    state.settings.tokens;


  $("#tokenValue")
    .textContent =
    state.settings.tokens;


  $("#temperature")
    .value =
    state.settings.temperature;


  $("#temperatureValue")
    .textContent =
    Number(
      state.settings.temperature
    ).toFixed(2);


  $("#topP")
    .value =
    state.settings.topP;


  $("#topPValue")
    .textContent =
    Number(
      state.settings.topP
    ).toFixed(2);


  $("#systemPrompt")
    .value =
    state.settings.systemPrompt;


  $("#remember")
    .checked =
    state.settings.remember;


  $("#typing")
    .checked =
    state.settings.typing;


  $("#sound")
    .checked =
    state.settings.sound;


  $("#glow")
    .checked =
    state.settings.glow;


  $("#compact")
    .checked =
    state.settings.compact;


  document.body
    .classList.toggle(
      "no-glow",
      !state.settings.glow
    );


  document.body
    .classList.toggle(
      "compact",
      state.settings.compact
    );


  if(state.model){

    $("#modelName")
      .textContent =
      state.model;


    $("#selectedModel")
      .textContent =
      state.model;

  }

}


/* =========================================================
   STARTUP
========================================================= */

const savedTheme =
  localStorage.getItem(
    "nova_theme"
  ) || "nova";


document.documentElement
  .dataset.theme =
  savedTheme;


$$(".theme")
  .forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.theme ===
        savedTheme
      );

    }
  );


loadSettings();


if(
  state.chats.length > 0
){

  state.current =
    state.chats[0];

}else{

  state.current = {

    id:
      crypto.randomUUID(),

    title:
      "New conversation",

    messages:[]

  };


  state.chats.push(
    state.current
  );


  saveState();

}


renderHistory();

renderMessages();
