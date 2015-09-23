var NewLocales = {};
var hasChanges = false;

window.onbeforeunload = function(e) {
    return hasChanges ? 'You have ' + oLE.getChangesCount() + ' unsaved changes!\nAre you sure you want to discard them?' : null;
};

var LocalesEditor = function(){
    var container;
    var langs = ['en', 'th'];
    var lang = 'en';
    var langColors = {
        en: '#ffaa99',
        th: '#99ffaa'
    }
    
    var openedSections = {};
    var changedLocales = {};
    
    this.getChangesCount = function(){
        var count = 0;
        for(var lang in changedLocales){
            for(change in changedLocales[lang]){
                if(changedLocales[lang][change]){
                    count++;
                }
            }
        }
        return count;
    }
    
    this.init = function(id){
        
        if(localStorage.getItem('lang') && langs.indexOf(localStorage.getItem('lang')) >= 0){
            lang = localStorage.getItem('lang');
            $('#select-lang').val(lang);
        }
        this.setLang(lang);
        
        if(localStorage.getItem('openedSections')){
            openedSections = JSON.parse(localStorage.getItem('openedSections'));
        }
        
        NewLocales = $.extend({}, Locales);
        
        container = $('#' + id);
        this.drawTree();
        
        $('#select-lang').change(function(ed){
            return function(){
                ed.setLang($('#select-lang').val());
                ed.drawTree();
            }
        }(this));
        
        $(window).keydown(function(ed){
            return function(event) {
                if (!(event.which == 83 && event.ctrlKey) && !(event.which == 19)) return true;
                ed.save();
                event.preventDefault();
                return false;
            }
        }(this));        
        
    };
    
    this.setLang = function(language){
        lang = language;
        localStorage.setItem('lang', lang);
        $('#select-lang, body').css('background-color', langColors[lang]);
    }

    this.drawTree = function(){
        container.empty();
        for(var section in Locales){
            addSection(section);
            addSectionForm(section);
            updateStats();
        }
    }

    var updateStats = function(){
        var totalVars = 0;
        var totalChanged = 0;
        var totalEmpty = 0;
        $("input, textarea").removeClass('var-empty');
        $("input, textarea").filter(function(){
            return !this.value;
        }).addClass('var-empty');
        for(var section in Locales){
            var totalCount = $('#section-' + section + ' .locale-row').length;
            var changesCount = $('#section-' + section + ' .locale-row.changed').length;
            var emptyCount = $('#section-' + section + ' .var-empty').length;
            var total = totalCount + ' vars'
            var changed = changesCount ? (', ' + changesCount + ' changed') : '';
            var empty = emptyCount ? (', ' + emptyCount + ' empty') : '';
            $('#section-changes-' + section).html(total + empty + changed);
            totalVars += totalCount;
            totalChanged += changesCount;
            totalEmpty += emptyCount;
            $('.var-stats').html(totalVars + ' vars<Br/>' + totalEmpty + ' empty<br />' + totalChanged + ' changed');
        }
    }

    this.download = function(){
        _download('locales.js', 'Locales = ' + JSON.stringify(NewLocales, null, 4));
    }
    
    this.save = function(){
        if($('.error').length){
            alert('Please fix all errors first!');
            return;
        }
        if(hasChanges){
            showLoader();
            $.post('save.php', {locale: 'Locales = ' + JSON.stringify(NewLocales, null, 4)}, function(){
                hasChanges = false;
                document.location.reload();
            });
        }else{
            alert('Nothing to save');
        }
    }
    
    this.expand = function(){
        $('.section-form').addClass('opened');
    }

    this.collapse = function(){
        $('.section-form').removeClass('opened');
    }

    var checkSpecialTags = function(oldStr, newStr){
        // Checks for <.*>, %.*%, _.*_
        if(lang !== 'en'){
            var regexp = new RegExp('%.*?%|_.*?_|<.*?>', 'ig');
            var oldMatches = oldStr.match(regexp);
            var newMatches = newStr.match(regexp);
            if(oldMatches || newMatches){
                var changed = false;
                if((!oldMatches && newMatches) || (oldMatches && !newMatches)){
                    changed = true;
                }else{
                    for(var i = 0; i< oldMatches.length; i++){
                        if(newMatches.indexOf(oldMatches[i]) < 0){
                            changed = true;
                            break;
                        }
                    }
                    for(var i = 0; i< newMatches.length; i++){
                        if(oldMatches.indexOf(newMatches[i]) < 0){
                            changed = true;
                            break;
                        }
                    }
                }
                if(changed){
                    alert('Special constructions were changed!\nDO NOT CHANGE ANYTHING INSIDE <...>, %...% or _..._ !!!');
                    return false;
                }
            }
        }
        return true;
    }

    var showLoader = function(){
        $('#loader').show();
        $('#loader-content').show();
    }

    var addSection = function(sectionName){
        var sectionContainer = $('<DIV>');
        sectionContainer.attr('id', 'section-' + sectionName);
        sectionContainer.addClass('section-container');

        var sectionHeaderRow = $('<DIV>');
        sectionHeaderRow.addClass('row section-header');

        var sectionHeader = $('<DIV>');
        sectionHeader.addClass('col-xs-8');
        sectionHeader.append(sectionName.capitalize());

        var sectionChanges = $('<DIV>');
        sectionChanges.addClass('col-xs-4 text-right section-changes');
        sectionChanges.attr('id', 'section-changes-' + sectionName);

        sectionHeaderRow.append(sectionHeader);
        sectionHeaderRow.append(sectionChanges);
        
        var sectionFormRow = $('<DIV>');
        sectionFormRow.addClass('row');
        
        var sectionForm = $('<DIV>');
        sectionForm.addClass('col-xs-12 section-form');
        
        if('undefined' !== typeof(openedSections[sectionName]) && openedSections[sectionName]){
            sectionForm.addClass('opened');
        }

        sectionFormRow.append(sectionForm);

        sectionHeaderRow.click(function(sectionForm, sectionName){
            return function(){
                openedSections[sectionName] = ('undefined' !== typeof(openedSections[sectionName])) ? !openedSections[sectionName] : true;
                localStorage.setItem('openedSections', JSON.stringify(openedSections));
                sectionForm.toggleClass('opened');
            }
        }(sectionForm, sectionName));

        sectionContainer.append(sectionHeaderRow);
        sectionContainer.append(sectionFormRow);
        container.append(sectionContainer);
    }
    
    var addSectionForm = function(sectionName){
        var aSection = Locales[sectionName];
        var sectionForm = $('#section-' + sectionName + ' .section-form');
        for(var langVar in aSection){
            var localeRow = $('<DIV>');
            localeRow.addClass('row locale-row');
            localeRow.attr('id', 'locale-row-' + langVar);

            if('undefined' !== typeof(changedLocales[lang]) && 'undefined' !== typeof(changedLocales[lang][sectionName + ' - ' + langVar])){
                if(changedLocales[lang][sectionName + ' - ' + langVar]){
                    localeRow.addClass('changed');
                }
            }
            
            var localeHeader = $('<DIV>');
            localeHeader.addClass('col-xs-2 text-right locale-header');
            localeHeader.append(langVar + ':');

            var localeInput = $('<DIV>');
            localeInput.addClass('col-xs-6');
            
            var locale = getLocale(sectionName, langVar, lang);
            var localeEn = getLocale(sectionName, langVar, 'en');
            if(localeEn.indexOf("\n") < 0){
                var input = $('<INPUT>');
            }else{
                var rows = localeEn.split("\n").length + 1;
                var input = $('<TEXTAREA>');
                input.width('100%');
                input.attr('rows', rows);
            }
            input.attr('data-original', locale);
            if(!locale){
                input.attr('placeholder', localeEn);
            }
            input.addClass('form-control input-sm');
            input.attr('id', 'locale-var-' + sectionName + '-' + langVar);

            input.attr('data-section', sectionName);
            input.attr('data-locale', langVar);

            input.change(function(_lang){
                return function(){
                    if('undefined' === typeof(changedLocales[lang])){
                        changedLocales[lang] = {};
                    }
                    $(this).removeClass('error');
                    if($(this).val() != $(this).attr('data-original')){
                        var enOrig = getLocale($(this).attr('data-section'), $(this).attr('data-locale'), 'en');
                        if(!checkSpecialTags(enOrig, $(this).val())){
                            $(this).addClass('error');
                            return;
                        }

                        if($(this).val().indexOf('%') >= 0){
                            var re = /%(.*?)%/g;
                            var matches = $(this).val().match(re);
                            if(matches && matches.length){
                                for(var i=0; i<matches.length; i++){
                                    var match = matches[i];
                                    var tst = /^[a-zA-Z0-9%_.]+$/g;
                                    if(!tst.test(match)){
                                        alert('Invalid symbols in %var% constructon detected!\nOnly a-z and digits allowed!');
                                        $(this).addClass('error');
                                        return;
                                    }
                                }
                            }
                        }
                        
                        var aOrigin = NewLocales[$(this).attr('data-section')][$(this).attr('data-locale')];
                        if('object' !== typeof(aOrigin)){
                            aOrigin = {
                                en: aOrigin
                            };
                        }
                        aOrigin[_lang] = $(this).val();
                        NewLocales[$(this).attr('data-section')][$(this).attr('data-locale')] = aOrigin;
                        $(this).parents('.locale-row').addClass('changed');
                        changedLocales[lang][$(this).attr('data-section') + ' - ' + $(this).attr('data-locale')] = true;
                    }else{
                        $(this).parents('.locale-row').removeClass('changed');
                        $(this).next('.locale-original').hide();
                        changedLocales[lang][$(this).attr('data-section') + ' - ' + $(this).attr('data-locale')] = false;
                    }
                    updateStats();
                    hasChanges = ($('.locale-row.changed').length > 0);
                }
            }(lang));
            
            input.val(locale);

            localeInput.append(input);

            if(false && lang !== 'en'){
                var tools = $('<DIV>');
                tools.addClass('locale-tools');

                var localeChangedText = $('<span>');                
                localeChangedText.addClass('locale-changed');
                localeChangedText.text('Show Original');
                localeChangedText.attr('title', 'Click to show original');

                localeChangedText.click(function(){
                    $(this).text(('Show Original' == $(this).text()) ? 'Hide Original' : 'Show Original');
                    $(this).parent().next().toggle();
                });
                tools.append(localeChangedText);

                var original = $('<PRE>');
                original.addClass('locale-original');
                original.text(locale);

                localeInput.append(tools);
                localeInput.append(original);                
            }

            var localeEng = $('<PRE>');
            localeEng.addClass('col-xs-4 locale-en');
            localeEng.text(localeEn);


            localeRow.append(localeHeader);
            localeRow.append(localeInput);
            localeRow.append(localeEng);
            
            sectionForm.append(localeRow);
        }
    }

    var _download = function(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

$(document).ready(function(){
    oLE = new LocalesEditor();
    oLE.init('edit-area');
});


getLocale = function(type, key, lang){
    if(typeof(lang) === 'undefined'){
        lang = 'en';
    }
    var locale = Locales[type];
    var result = ((typeof(locale[key]) === 'string') && (lang === 'en')) ? locale[key] : '';
    if('object' === typeof(locale[key]) && 'undefined' !== typeof(locale[key][lang])){
        result = locale[key][lang];
    }
    return result;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}