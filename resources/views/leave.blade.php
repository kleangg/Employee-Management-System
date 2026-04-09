<!DOCTYPE html>
<html lang="{{str_replace('_', '-', app()->getLocale())}}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Leave Management</title>

        <link href="{{asset('css/app.css')}}" rel="stylesheet">
        <style>
            body {
                font-family: 'Nunito', sans-serif;
                margin: 0;
            }
        </style>
    </head>
    <body class="antialiased">
        <!-- Sidebar and Main Content in Row -->
        <div style="display: flex; height: 100vh; overflow: hidden;">
            <div id="sideBar" style="flex-shrink: 0;">
            </div>

            <div id="leavePage" style="flex: 1; overflow-y: auto; background-color: #f3f4f6;">
            </div>
        </div>

        <script src="/js/app.js"></script>
    </body>
        