'This is a script generated from Node.js
'This runs the macro below
RunMacro
'The RunMacro procedure
Sub RunMacro()
Dim xl
Dim xlBook
Dim sCurPath
sCurPath = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName(".")
Set xl = CreateObject("Excel.application")
Set xlBook = xl.Workbooks.Open(sCurPath+"\"+WScript.Arguments(0), 0, True)
xl.Application.Visible = True
xl.DisplayAlerts = False
xl.Application.run "showTwoParameters", WScript.Arguments(1), WScript.Arguments(2)
xl.ActiveWindow.close
xl.Quit
Set xlBook = Nothing
End Sub
