const API_URL = "http://localhost:8000";

let sessionToken = null;
let currentUser = null;
let currentCustomer = null;


// =========================================================
// 저장된 로그인 확인
// =========================================================

function getSavedLogin() {

    const token =
        localStorage.getItem("session_token");

    if (!token) {
        return false;
    }

    sessionToken = token;

    return true;
}


// =========================================================
// API 요청
// =========================================================

async function apiRequest(
    url,
    options = {}
) {

    const response = await fetch(
        `${API_URL}${url}`,
        options
    );

    let data = {};

    try {

        data = await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "요청에 실패했습니다."
        );

    }


    return data;
}


// =========================================================
// 현재 로그인 사용자 / Customer
// =========================================================

async function loadMe() {

    if (!sessionToken) {

        throw new Error(
            "로그인이 필요합니다."
        );

    }


    const data =
        await apiRequest(
            `/me?session_token=${encodeURIComponent(sessionToken)}`
        );


    currentUser =
        data.user;


    currentCustomer =
        data.customer;


    return data;
}


// =========================================================
// Customer 정보 불러오기
// =========================================================

async function loadCustomerData() {

    try {

        const data =
            await loadMe();


        // -------------------------------------------------
        // 관리자
        // -------------------------------------------------

        if (!data.customer) {

            const customerName =
                document.getElementById(
                    "customer-name"
                );


            if (customerName) {

                customerName.textContent =
                    "관리자";

            }


            return;

        }


        // -------------------------------------------------
        // Customer 이름
        // -------------------------------------------------

        const customerName =
            document.getElementById(
                "customer-name"
            );


        if (customerName) {

            customerName.textContent =
                data.customer.name ||
                data.customer.id ||
                "";

        }


        // -------------------------------------------------
        // Scene
        // -------------------------------------------------

        renderScenes(
            data.customer.scenes || {}
        );


        // -------------------------------------------------
        // Device
        // -------------------------------------------------

        renderDevices(
            data.customer.locations || {}
        );


    } catch (error) {

        console.error(
            "Customer 정보 불러오기 실패:",
            error
        );


        const customerName =
            document.getElementById(
                "customer-name"
            );


        if (customerName) {

            customerName.textContent =
                "공간 정보를 불러오지 못했습니다.";

        }

    }

}


// =========================================================
// Scene
// =========================================================

function renderScenes(
    scenes
) {

    const container =
        document.getElementById(
            "scene-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !scenes ||
        Object.keys(scenes).length === 0
    ) {

        container.textContent =
            "등록된 Scene이 없습니다.";

        return;

    }


    // -----------------------------------------------------
    // 장소별 Scene
    // -----------------------------------------------------

    Object.entries(
        scenes
    ).forEach(
        ([locationId, locationScenes]) => {


            if (
                !locationScenes ||
                Object.keys(locationScenes).length === 0
            ) {

                return;

            }


            const group =
                document.createElement(
                    "div"
                );


            group.className =
                "scene-group";


            // 장소 이름

            const groupTitle =
                document.createElement(
                    "h3"
                );


            groupTitle.textContent =
                getLocationName(
                    locationId
                );


            group.appendChild(
                groupTitle
            );


            // 버튼 Row

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "scene-row";


            Object.entries(
                locationScenes
            ).forEach(
                ([sceneId, scene]) => {


                    const button =
                        document.createElement(
                            "button"
                        );


                    const icon =
                        document.createElement(
                            "span"
                        );


                    icon.className =
                        "scene-icon";


                    icon.textContent =
                        scene.icon || "●";


                    const name =
                        document.createElement(
                            "span"
                        );


                    name.textContent =
                        scene.name ||
                        sceneId;


                    button.appendChild(
                        icon
                    );


                    button.appendChild(
                        name
                    );


                    button.addEventListener(
                        "click",
                        () => {

                            executeScene(
                                locationId,
                                sceneId
                            );

                        }
                    );


                    row.appendChild(
                        button
                    );

                }
            );


            group.appendChild(
                row
            );


            container.appendChild(
                group
            );

        }
    );

}


// =========================================================
// Location 이름
// =========================================================

function getLocationName(
    locationId
) {

    const locations =
        currentCustomer?.locations || {};


    const location =
        locations[locationId];


    if (location?.name) {

        return location.name;

    }


    const defaultNames = {

        home: "집",

        office: "사무실"

    };


    return (
        defaultNames[locationId] ||
        locationId
    );

}


// =========================================================
// Device
// =========================================================

function renderDevices(
    locations
) {

    const container =
        document.getElementById(
            "device-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !locations ||
        Object.keys(locations).length === 0
    ) {

        container.textContent =
            "등록된 기기가 없습니다.";

        return;

    }


    // -----------------------------------------------------
    // Location
    // -----------------------------------------------------

    Object.entries(
        locations
    ).forEach(
        ([locationId, location]) => {


            const locationElement =
                document.createElement(
                    "div"
                );


            locationElement.className =
                "device-location";


            // 장소 이름

            const locationTitle =
                document.createElement(
                    "h3"
                );


            locationTitle.textContent =
                location.name ||
                locationId;


            locationElement.appendChild(
                locationTitle
            );


            const rooms =
                location.rooms || {};


            // -------------------------------------------------
            // Room
            // -------------------------------------------------

            Object.entries(
                rooms
            ).forEach(
                ([roomId, room]) => {


                    const roomElement =
                        document.createElement(
                            "div"
                        );


                    roomElement.className =
                        "room";


                    // 방 이름

                    const roomTitle =
                        document.createElement(
                            "h4"
                        );


                    roomTitle.textContent =
                        room.name ||
                        roomId;


                    roomElement.appendChild(
                        roomTitle
                    );


                    const devices =
                        room.devices || {};


                    // -------------------------------------------------
                    // Device
                    // -------------------------------------------------

                    Object.entries(
                        devices
                    ).forEach(
                        ([deviceId, device]) => {


                            const card =
                                createDeviceCard(
                                    deviceId,
                                    device
                                );


                            roomElement.appendChild(
                                card
                            );

                        }
                    );


                    locationElement.appendChild(
                        roomElement
                    );

                }
            );


            container.appendChild(
                locationElement
            );

        }
    );

}


// =========================================================
// Device Card
// =========================================================

function createDeviceCard(
    deviceId,
    device
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "device";


    // -----------------------------------------------------
    // Device Name
    // -----------------------------------------------------

    const deviceName =
        document.createElement(
            "div"
        );


    deviceName.className =
        "device-name";


    // Icon

    const icon =
        document.createElement(
            "span"
        );


    icon.className =
        "device-icon";


    icon.textContent =
        device.icon || "💡";


    // Name

    const name =
        document.createElement(
            "span"
        );


    name.textContent =
        device.name ||
        deviceId;


    deviceName.appendChild(
        icon
    );


    deviceName.appendChild(
        name
    );


    // -----------------------------------------------------
    // Status
    // -----------------------------------------------------

    const status =
        document.createElement(
            "div"
        );


    status.className =
        "status";


    const state =
        String(
            device.state || "off"
        ).toLowerCase();


    if (
        state === "on" ||
        state === "true" ||
        state === "active"
    ) {

        status.textContent =
            "ON";


        status.classList.add(
            "on"
        );

    } else {

        status.textContent =
            "OFF";


        status.classList.add(
            "off"
        );

    }


    card.appendChild(
        deviceName
    );


    card.appendChild(
        status
    );


    return card;

}


// =========================================================
// Scene 실행
// =========================================================

async function executeScene(
    location,
    sceneName
) {

    if (!sessionToken) {

        return;

    }


    const result =
        document.getElementById(
            "api-result"
        );


    try {

        const data =
            await apiRequest(

                `/scene/${encodeURIComponent(location)}/${encodeURIComponent(sceneName)}?session_token=${encodeURIComponent(sessionToken)}`,

                {
                    method: "POST"
                }

            );


        console.log(
            "Scene 실행 결과:",
            data
        );


        if (result) {

            result.textContent =
                `${data.scene} 실행 완료`;


            result.className =
                "success";

        }


    } catch (error) {

        console.error(
            "Scene 실행 실패:",
            error
        );


        if (result) {

            result.textContent =
                error.message;


            result.className =
                "";

        }

    }

}


// =========================================================
// 로그아웃
// =========================================================

function logout() {

    sessionToken = null;

    currentUser = null;

    currentCustomer = null;


    localStorage.removeItem(
        "session_token"
    );


    window.location.href =
        "login.html";

}


// =========================================================
// 앱 시작
// =========================================================

async function initializeApp() {

    console.log(
        "Design Your Scene 시작"
    );


    // 저장된 로그인 없음

    if (!getSavedLogin()) {

        window.location.href =
            "login.html";

        return;

    }


    // 저장된 로그인 있음

    await loadCustomerData();

}


// =========================================================
// DOM Ready
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApp();

    }
);