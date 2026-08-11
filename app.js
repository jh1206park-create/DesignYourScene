const sceneButtons = document.querySelectorAll(".scene-row button");

sceneButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sceneName = button.querySelector("span").textContent;

        alert(sceneName + " Scene을 실행합니다.");

    });

});