<html>
<head>
    <title>AmiLabs Locales Editor</title>
    <meta name="description" content="">
    <meta name="author" content="AmiLabs">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
    <style>
body {
    background: #fff;
    font-family: Arial;
    font-size: 12px;
}
.Differences {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    empty-cells: show;
}

.Differences thead th {
    text-align: left;
    border-bottom: 1px solid #000;
    background: #aaa;
    color: #000;
    padding: 4px;
}
.Differences tbody th {
    text-align: right;
    background: #ccc;
    width: 4em;
    padding: 1px 2px;
    border-right: 1px solid #000;
    vertical-align: top;
    font-size: 13px;
}

.Differences td {
    padding: 1px 2px;
    font-family: Consolas, monospace;
    font-size: 13px;
}

.DifferencesSideBySide .ChangeInsert td.Left {
    background: #dfd;
}

.DifferencesSideBySide .ChangeInsert td.Right {
    background: #cfc;
}

.DifferencesSideBySide .ChangeDelete td.Left {
    background: #f88;
}

.DifferencesSideBySide .ChangeDelete td.Right {
    background: #faa;
}

.DifferencesSideBySide .ChangeReplace .Left {
    background: #fe9;
}

.DifferencesSideBySide .ChangeReplace .Right {
    background: #fd8;
}

.Differences ins, .Differences del {
    text-decoration: none;
}

.DifferencesSideBySide .ChangeReplace ins, .DifferencesSideBySide .ChangeReplace del {
    background: #fc0;
}

.Differences .Skipped {
    background: #f7f7f7;
}

.DifferencesInline .ChangeReplace .Left,
.DifferencesInline .ChangeDelete .Left {
    background: #fdd;
}

.DifferencesInline .ChangeReplace .Right,
.DifferencesInline .ChangeInsert .Right {
    background: #dfd;
}

.DifferencesInline .ChangeReplace ins {
    background: #9e9;
}

.DifferencesInline .ChangeReplace del {
    background: #e99;
}

pre {
    width: 100%;
    overflow: auto;
}
    </style>
</head>
<body>
<?php

include 'diff/lib/Diff.php';

$days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
$aDir = glob(dirname(__FILE__) . '/backup/*.*');
$now = time();
$diff = $days * 24 * 3600;
$aFiles = array();
$aDiffs = array();
foreach($aDir as $filename){
    $aMatches = array();
    preg_match('/(\d+)/i', $filename, $aMatches);
    if( isset($aMatches[1])){
       $time = (int)$aMatches[1];
       if(($now - $time) < $diff){
           $aFiles[$time . "|"] = $filename;
       }
    }
}
ksort($aFiles);

$options = array(
    'ignoreWhitespace' => true,
    'ignoreCase' => true,
);

require_once dirname(__FILE__).'/diff/lib/Diff/Renderer/Html/Inline.php';
$renderer = new Diff_Renderer_Html_Inline;

$isFirst = true;
$prev = '';
$first = '';
$user = '';
$pfile = '';
foreach($aFiles as $key => $file){
    $curr = explode("\n", file_get_contents($file));
    if(!$isFirst){
        echo "<br><b>[" . $date . "] - " . $user . "</b> ($pfile)<br>";
        $diff = new Diff($prev, $curr, $options);
        echo $diff->render($renderer);
        echo "<hr>";
    }else{
        $first = $curr;
        $isFirst = false;
    }
    $pfile = substr($file, strrpos($file, '/'));
    $date = date("d.m.Y H:i:s", (int)str_replace('|', '', $key));
    preg_match('/locales-(.*)-/iU', $file, $aMatches);
    $user = ucfirst($aMatches[1]);
    $prev = $curr;
}

$curr = explode("\n", file_get_contents("locales.js"));
echo "<br><b>[" . $date . "] - " . $user . "</b> ($pfile)<br>";
$diff = new Diff($prev, $curr, $options);
echo $diff->render($renderer);
echo "<hr>";

?>
</body>
</html>