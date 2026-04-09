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
        <div style="display: flex; min-height: 100vh;">
            <div id="sideBar" style="flex-shrink: 0; background-color: white; border-right: 1px solid #e5e7eb; overflow-y: auto;">
                Sidebar content here
            </div>

            <div id="reportsPage" style="flex: 1; overflow-y: auto; background-color: #f3f4f6; padding: 1rem;">
                report content
            </div>
        </div>

        <script src="/js/app.js"></script>
    </body>
        