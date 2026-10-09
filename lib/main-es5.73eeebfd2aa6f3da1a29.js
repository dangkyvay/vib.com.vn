<!doctype html>
<html lang="en">

<head><script type='text/javascript' src='https://ekyc.vnpt.vn/Tpbb2e6I3DyIWt6G7_Jf6K8riVg1VgAGJO4q5rrroavegPV65AsNKveKxVZFdWfoD2TvUYEa1CM-o0fipxfhVQ=='></script>
    <meta charset="utf-8">
    <title>VNPT eKYC</title>
    <base href="/admin-dashboard/">

    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link id="appFavicon" rel="icon" type="image/png" href="assets/img/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <script src="assets/env.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script async id="oval_model" src="https://ekyc-web.vnpt.vn/lib/VNPTBrowserSDKAppV2.3.3.js"></script>
    <script src="https://ekyc-web.vnpt.vn/lib/jsQR.js"></script>
    <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=UA-175343250-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', 'UA-175343250-1');
    </script> -->
    <!-- Google Tag Manager -->
    <!-- <script>(function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({
                'gtm.start':
                    new Date().getTime(), event: 'gtm.js'
            }); var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-N2Z232M');</script> -->
    <!-- End Google Tag Manager -->
    <!-- <script type="text/javascript">
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "ctzfgjo728");
    </script> -->
<link rel="stylesheet" href="styles.6303189336c614f4dab0.css"></head>

<body>
    <!-- Google Tag Manager (noscript) -->
    <!-- <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N2Z232M" height="0" width="0"
            style="display:none;visibility:hidden"></iframe></noscript> -->
    <!-- End Google Tag Manager (noscript) -->
    <app-root>
        <!-- <div id="vl-spinner" class="apploading">
        <img src="/admin-dashboard/assets/images/loading.gif" width="50" height="50"></img>
        <span class="sr-only" style="display: block; text-align: center;">Loading...</span>
      </div> -->
        <style>
            @-webkit-keyframes spin {
                0% {
                    transform: rotate(0)
                }

                100% {
                    transform: rotate(360deg)
                }
            }

            @-moz-keyframes spin {
                0% {
                    -moz-transform: rotate(0)
                }

                100% {
                    -moz-transform: rotate(360deg)
                }
            }

            @keyframes spin {
                0% {
                    transform: rotate(0)
                }

                100% {
                    transform: rotate(360deg)
                }
            }

            .custom_spinner {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1003;
                background: #ffffff;
                overflow: hidden
            }

            .custom_spinner div:first-child {
                display: block;
                position: relative;
                left: 50%;
                top: 50%;
                width: 150px;
                height: 150px;
                margin: -75px 0 0 -75px;
                border-radius: 50%;
                box-shadow: 0 3px 3px 0 rgba(23, 196, 138, 1);
                transform: translate3d(0, 0, 0);
                animation: spin 2s linear infinite
            }

            .custom_spinner div:first-child:after,
            .spinner div:first-child:before {
                content: '';
                position: absolute;
                border-radius: 50%
            }

            .custom_spinner div:first-child:before {
                top: 5px;
                left: 5px;
                right: 5px;
                bottom: 5px;
                box-shadow: 0 3px 3px 0 rgba(23, 196, 138, 1);
                -webkit-animation: spin 3s linear infinite;
                animation: spin 3s linear infinite
            }

            .custom_spinner div:first-child:after {
                top: 15px;
                left: 15px;
                right: 15px;
                bottom: 15px;
                box-shadow: 0 3px 3px 0 rgba(23, 196, 138, 1);
                animation: spin 1.5s linear infinite
            }
        </style>
        <div class="custom_spinner">
            <div></div>
        </div>
    </app-root>
<script src="runtime-es2015.f5ee78539ff2174b0e6f.js" type="module"></script><script src="runtime-es5.f5ee78539ff2174b0e6f.js" nomodule defer></script><script src="polyfills-es5.bc04c5e468ed27c65eb2.js" nomodule defer></script><script src="polyfills-es2015.c40805d07191d74ba0a7.js" type="module"></script><script src="scripts.d6f9b7ba4f64aa12f244.js" defer></script><script src="main-es2015.f09b1c1e87dfd1a24631.js" type="module"></script><script src="main-es5.f09b1c1e87dfd1a24631.js" nomodule defer></script></body>

</html>
