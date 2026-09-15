const API_URL =
    "https://script.google.com/macros/s/AKfycby9EAteDad4Z-TIbHBaZ2UU6q4XAb1WJI-nPL307EiH5ENU3gjOcsbHy3inkT-XH3DFZw/exec";


/* =========================================================
   DAFTAR HALAMAN YANG HANYA BOLEH DIAKSES ADMIN
========================================================= */

const ADMIN_PAGES = [
    "admin.html",
    "input_buku.html",
    "input_jurnal.html",
    "laporan_buku.html",
    "laporan_jurnal.html"
];


/* =========================================================
   CEK AKSES ADMIN
========================================================= */

function checkAdminAccess() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /* =====================================================
       JIKA BUKAN HALAMAN ADMIN
       TIDAK PERLU MELAKUKAN PEMERIKSAAN
    ===================================================== */

    if (!ADMIN_PAGES.includes(currentPage)) {
        return;
    }


    /* =====================================================
       AMBIL DATA USER
    ===================================================== */

    const userData =
        localStorage.getItem("user");


    /* =====================================================
       BELUM LOGIN
    ===================================================== */

    if (!userData) {

        alert(
            "Silakan login terlebih dahulu untuk mengakses halaman ini."
        );

        window.location.href =
            "login.html";

        return;
    }


    /* =====================================================
       PERIKSA DATA USER
    ===================================================== */

    try {

        const user =
            JSON.parse(userData);


        const role =
            String(
                user.role || ""
            )
            .trim()
            .toLowerCase();


        /* =================================================
           BUKAN ADMIN
        ================================================= */

        if (role !== "admin") {

            alert(
                "Anda tidak memiliki akses ke halaman ini."
            );

            window.location.href =
                "dashboard.html";

            return;
        }


        /* =================================================
           ADMIN
           IZINKAN HALAMAN DIBUKA
        ================================================= */

        console.log(
            "Akses admin diberikan:",
            currentPage
        );


    } catch (error) {

        console.error(
            "Data user tidak valid:",
            error
        );


        localStorage.removeItem("user");

        localStorage.removeItem("username");

        localStorage.removeItem("role");


        alert(
            "Sesi login tidak valid. Silakan login kembali."
        );


        window.location.href =
            "login.html";
    }
}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");

    const message =
        document.getElementById("message");


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value.trim();


            /* =================================================
               VALIDASI INPUT
            ================================================= */

            if (!username || !password) {

                message.style.color =
                    "red";

                message.innerText =
                    "Username dan password wajib diisi.";

                return;
            }


            /* =================================================
               TOMBOL PROSES
            ================================================= */

            loginButton.disabled =
                true;

            loginButton.innerText =
                "MEMPROSES...";

            message.innerText =
                "";


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            redirect: "follow",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body:
                                JSON.stringify({

                                    action: "login",

                                    username:
                                        username,

                                    password:
                                        password

                                })
                        }
                    );


                /* =================================================
                   CEK RESPONSE SERVER
                ================================================= */

                if (!response.ok) {

                    throw new Error(
                        "Server error: " +
                        response.status
                    );
                }


                const result =
                    await response.json();


                console.log(
                    "Response login:",
                    result
                );


                /* =================================================
                   LOGIN BERHASIL
                ================================================= */

                if (result.success) {

                    if (!result.user) {

                        throw new Error(
                            "Data user tidak ditemukan."
                        );
                    }


                    /* =================================================
                       SIMPAN DATA USER
                    ================================================= */

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            result.user
                        )
                    );


                    /* =================================================
                       SIMPAN USERNAME
                       UNTUK KOMPATIBILITAS HALAMAN LAMA
                    ================================================= */

                    localStorage.setItem(
                        "username",
                        result.user.username || ""
                    );


                    /* =================================================
                       SIMPAN ROLE
                    ================================================= */

                    localStorage.setItem(
                        "role",
                        String(
                            result.user.role || ""
                        )
                        .toLowerCase()
                    );


                    /* =================================================
                       PESAN BERHASIL
                    ================================================= */

                    message.style.color =
                        "green";

                    message.innerText =
                        result.message ||
                        "Login berhasil.";


                    loginButton.innerText =
                        "LOGIN BERHASIL";


                    /* =================================================
                       MASUK KE DASHBOARD
                    ================================================= */

                    setTimeout(
                        function () {

                            window.location.href =
                                "dashboard.html";

                        },
                        500
                    );


                }

                /* =================================================
                   LOGIN GAGAL
                ================================================= */

                else {

                    message.style.color =
                        "red";

                    message.innerText =
                        result.message ||
                        "Username atau password salah.";


                    loginButton.disabled =
                        false;

                    loginButton.innerText =
                        "LOGIN";
                }


            } catch (error) {

                console.error(
                    "ERROR LOGIN:",
                    error
                );


                message.style.color =
                    "red";

                message.innerText =
                    "Tidak dapat terhubung ke server.";


                loginButton.disabled =
                    false;

                loginButton.innerText =
                    "LOGIN";
            }

        }
    );
}


/* =========================================================
   NAVBAR
========================================================= */

function setupNavbar() {

    const userData =
        localStorage.getItem("user");


    const loginLogoutButton =
        document.getElementById(
            "loginLogoutButton"
        );


    const adminMenu =
        document.getElementById(
            "adminMenu"
        );


    const welcome =
        document.getElementById(
            "welcome"
        );


    /* =====================================================
       BELUM LOGIN
    ===================================================== */

    if (!userData) {

        if (adminMenu) {

            adminMenu.style.display =
                "none";
        }


        if (loginLogoutButton) {

            loginLogoutButton.innerText =
                "Login";

            loginLogoutButton.href =
                "login.html";

            loginLogoutButton.onclick =
                function () {

                    window.location.href =
                        "login.html";
                };
        }


        return;
    }


    /* =====================================================
       SUDAH LOGIN
    ===================================================== */

    try {

        const user =
            JSON.parse(userData);


        const nama =
            user.nama ||
            user.username ||
            "Pengguna";


        const role =
            String(
                user.role || ""
            )
            .trim()
            .toLowerCase();


        /* =================================================
           NAMA PENGGUNA
        ================================================= */

        if (welcome) {

            welcome.innerHTML =
                "Selamat datang, <b>" +
                escapeHTML(nama) +
                "</b>";
        }


        /* =================================================
           ADMIN
        ================================================= */

        if (role === "admin") {

            if (adminMenu) {

                adminMenu.style.display =
                    "block";
            }


            if (loginLogoutButton) {

                loginLogoutButton.innerText =
                    "Logout";

                loginLogoutButton.href =
                    "#";


                loginLogoutButton.onclick =
                    function (event) {

                        event.preventDefault();

                        logoutUser();
                    };
            }

        }


        /* =================================================
           USER BIASA
        ================================================= */

        else {

            if (adminMenu) {

                adminMenu.style.display =
                    "none";
            }


            if (loginLogoutButton) {

                loginLogoutButton.innerText =
                    "Logout";

                loginLogoutButton.href =
                    "#";


                loginLogoutButton.onclick =
                    function (event) {

                        event.preventDefault();

                        logoutUser();
                    };
            }
        }


    } catch (error) {

        console.error(
            "Data login rusak:",
            error
        );


        localStorage.removeItem("user");

        localStorage.removeItem("username");

        localStorage.removeItem("role");


        if (adminMenu) {

            adminMenu.style.display =
                "none";
        }


        if (loginLogoutButton) {

            loginLogoutButton.innerText =
                "Login";

            loginLogoutButton.href =
                "login.html";
        }
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem("user");

    localStorage.removeItem("username");

    localStorage.removeItem("role");


    window.location.href =
        "dashboard.html";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   JALANKAN SISTEM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           CEK AKSES HALAMAN ADMIN
        ================================================= */

        checkAdminAccess();


        /* =================================================
           JALANKAN NAVBAR
        ================================================= */

        setupNavbar();

    }
);