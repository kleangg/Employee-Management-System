<!DOCTYPE html>
<html lang="{{str_replace('_', '-', app()->getLocale())}}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Forgot Password — Employee Management System</title>
        <meta name="description" content="Reset your Employee Management System account password.">

        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Nunito', sans-serif;
                margin: 0;
            }
        </style>
    </head>
    <body class="antialiased">
        <div id="forgotPasswordPage" style="min-height: 100vh;"></div>

        <script src="/js/app.js"></script>
    </body>
</html>
