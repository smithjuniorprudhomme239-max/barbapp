[33mcommit 598c2ca923bb4793a26cd8f043191ade2b5e9f1a[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: Smith Junior Prud'homme <sjprudhome@joinhep.org>
Date:   Fri Jul 3 09:50:12 2026 +0100

    Initial commit - barber shop website

 index.html                    |   7 [32m+[m[31m-[m
 package-lock.json             |   9 [31m-[m
 server/routes/bookings.js     |   8 [32m+[m[31m-[m
 src/App.css                   |  51 [32m++[m[31m---[m
 src/components/About.jsx      |   8 [32m+[m[31m-[m
 src/components/Admin.jsx      |  57 [32m++[m[31m---[m
 src/components/Contact.css    | 480 [32m+++++++++++++++++++[m[31m-----------------------[m
 src/components/Contact.jsx    | 421 [32m+++++++++++++++++++[m[31m-----------------[m
 src/components/Footer.css     |  17 [32m+[m[31m-[m
 src/components/Gallery.css    | 266 [32m+++++++++++++++[m[31m--------[m
 src/components/Gallery.jsx    |  66 [32m++++[m[31m--[m
 src/components/Hero.css       |  54 [32m++++[m[31m-[m
 src/components/Hero.jsx       |   3 [32m+[m[31m-[m
 src/components/Login.css      |  16 [32m+[m[31m-[m
 src/components/MarketPage.jsx |  21 [32m+[m[31m-[m
 src/components/Navbar.css     |  28 [32m+[m[31m--[m
 src/components/Navbar.jsx     |   2 [32m+[m[31m-[m
 src/components/Services.css   | 235 [32m+++++++++++++++++++[m[31m--[m
 src/components/Services.jsx   |  37 [32m+++[m[31m-[m
 src/context/AuthContext.jsx   | 133 [32m++++++[m[31m------[m
 src/index.css                 |  84 [32m+++++++[m[31m-[m
 vite.config.js                |  18 [32m+[m[31m-[m
 22 files changed, 1197 insertions(+), 824 deletions(-)
