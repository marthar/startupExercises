/*!
 *Copyright (c) 2011 Cykod LLC
 Dual licensed under the MIT license and the GPL license

*/


/*
This module adds a code editor that shows up in individual slides

*/



(function($, deck, window, undefined) {
  var $d = $(document),
  $window = $(window),
  editorFocused = false

  function runCode(element,template) {
    iframe = document.createElement("IFRAME"); 
    iframe.style.width = ($(element).parent().width()-2) + "px";
    iframe.style.height = ($(element).parent().height()-2) + "px";
    iframe.style.overflow = 'auto';
    iframe.style.border ="none";

    var dest = $(element).attr('data-target');
    var destination = $("#" + dest );
    $(destination).html("").append(iframe);


    var editor = $(element).data('editor');
    var code = editor.getValue();

    var language = $(element).attr('data-language');


    if($(element).attr('data-save')) {
      localStorage[$(element).attr('data-save')] = code;
    }

    if(language == 'js') {
      code = "<scr" + "ipt>\n" + code + "\n</scr" + "ipt>";
    }

    var tmpl = $(template ? "#" + template : "#coderdeck-default").html();

    code = "<!DOCTYPE HTML>" + tmpl.replace(/END/,'</s' + 'cript>').replace(/CODE/,code);

    writeIFrame(iframe,code);
  }



  function writeIFrame(iframe,code) {
    iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
    iframe.document.open();
    iframe.document.write(code);
    iframe.document.close();
  }



 function focusCallback() {
   disableKeyboardEvents = true;
  }

  function blurCallback() {
    disableKeyboardEvents = false;
  }


  $d.bind('deck.init',function() {

    $("a").attr('target','_blank');

    $.each($[deck]('getSlides'), function(idx, $el) {
      var slide = $($el);

      var element =slide.find(".coder-editor"); 
      var full = $(element).hasClass('coder-editor-full');
      var fullClass = full ? " coder-wrapper-full" : " coder-wrapper-split";

      $(element).data('full',full);
      $(element).data('instant',element.hasClass('coder-editor-instant'));

      slide.find(".coder-editor").attr({
        'id': 'editor-' + idx,
        'data-target' : 'destination-' + idx
        }).wrapAll("<div class='coder-wrapper" + fullClass + "'><div class='coder-editor-wrapper' id='wrapper-" + idx + "'></div></div>").css('position','static');

       $("<div class='coder-destination' id='destination-" + idx + "'></div>").insertAfter("#wrapper-"+idx);
        var solution = slide.find("script[type=codedeck]")[0]
        if(solution) {
          $(solution).attr({ 'id' : 'solution-' + idx });
          slide.find(".coder-editor").attr({ 'data-solution' : 'solution-' + idx });
        }

      });

      
      $d.unbind('keydown.deck').bind('keydown.deck', function(e) {
        if(!editorFocused) {
          switch (e.which) {
            case $.deck.defaults.keys.next:
            $.deck('next');
            e.preventDefault();
            break;
            case $.deck.defaults.keys.previous:
            $.deck('prev');
            e.preventDefault();
            break;
          }
        }
      });


  });


  $d.bind('deck.change',function(e,from,to) {
    var current =$[deck]('getSlide', to);
        
    current.find(".coder-wrapper").each(function() {
      if(!$(this).hasClass('coderEditor')) {

        var element = $(this).find('.coder-editor');
        var wrapper = $(this).find('.coder-editor-wrapper');

        var html = element.html().replace(/SCRIPT/g,'<script>').replace(/END/,'</s' + 'cript>').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

        if($(element).attr('data-save') && localStorage[$(element).attr('data-save')]) {
         html = localStorage[$(element).attr('data-save')];
       }

        var isFull = $(element).data('full');
        var isInstant = $(element).data('instant');

        $(element).css('visibility','visible');

        var editorOptions = { 
          lineNumbers: true,
          onFocus: function() { editorFocused = true; },
          onBlur: function() { editorFocused = false; },
          mode: 'htmlmixed'
        };

        var dest = $(element).attr('data-target');
        var destination = $("#" + dest );


        if(isInstant) {
          $(destination).show();
          editorOptions['onChange'] =  function() { runCode(element,$(element).attr('data-coder-template')); }
             
        }
        var editor = CodeMirror.fromTextArea(element[0], editorOptions );

        $(element).data('editor',editor);


        $(editor.getScrollerElement()).height($(current).height() - $(this).position().top - 80);
        $(this).addClass('coderEditor');


        var language = $(element).attr('data-language');


        destination.height($(current).height() - $(this).position().top - 80);


        editor.setValue(html);

        if(!isInstant) {
          $("<button>Run</button>").insertBefore(wrapper).click(function() {
            if(isFull) {  
              $(wrapper).hide();
            }
            $(destination).show();
            runCode(element,$(element).attr('data-coder-template'));

          });
        }

        if(isFull) { 
          $("<button>Back</button>").insertBefore(wrapper).click(function() {
            $(destination).toggle();
            $(wrapper).toggle();
          });
        }

        var solution = element.attr('data-solution');
        if(solution) {
          $("<button>Solution</button>").insertBefore(wrapper).click(function() {
              var html = $("#" + solution).html().replace(/SCRIPT/g,'<script>').replace(/END/,'</s' + 'cript>');
          editor.setValue(html);

          });
        }
      }
    });
    
  });

})(jQuery,'deck',this);
}

    if(config.isSaving) { loadFromLocalStorage($element,config); }

    $element.css('visibility','visible');

    var editor = setupCodeEditor(currentSlide,$container,$element,$destination,config);

    var $backButton = null;

    var $buttonWrapper = createButtonWrapper($wrapper);

    if(!config.isInstant) {
      createRunButton(config,$buttonWrapper, function() {
        if(config.isFull) {  
          $backButton.show();
          $wrapper.hide();
        }
        $destination.show();
        runCode($element,$element.attr('data-coder-template'));
      });
    } 

    if(config.isFull) { 
      $backButton = createBackbutton($buttonWrapper,function() {
        $destination.toggle();
        $wrapper.toggle();
      });
    }

    if(config.isSolution) {
      createSolution($buttonWrapper,function() {
        var solution = $element.attr('data-solution');
        editor.setValue(unsanitize($("#" + solution).html()));
      });

    }
  }

  function killDestination(slide) {
    slide.find(".coder-wrapper").each(function() {
      var $container = $(this);
      if($container.hasClass('coderEditor')) {
        var $element = $container.find('.coder-editor');
        var $wrapper = $container.find('.coder-editor-wrapper');
        var $destination = $("#" + $element.attr('data-target'));

        $wrapper.show();
        $destination.html("").hide();
      }
    });
  }

  function getGist(gistId) {
    url = 'https://api.github.com/gists/' + gistId + '?callback=?';
    $.getJSON(url, function(gistData) {
      var $gists = savedGistData[gistId],
      length = $gists.length;
      while(length--){
        var $gist = $($gists[length]);
        updateGistSlide( $gist, gistData );  
      }
    });
  }

  function updateGistSlide($gist, gistData) {
    var content = gistData.data.files["gistfile1.txt"].content,
    id = gistData.data.id,
    slide = $gist.parents('.slide'),
    type = $gist.attr('type'),
    classes = $gist.attr('data-gist-classes'),
    template = $gist.attr('data-coder-template') || '',
    language =  $gist.attr('data-language') || '',
    save = $gist.attr('data-save') || '';

    if(type === 'text/coderdeck') {
      $el = $('<script />')
      .attr('id', $gist.attr('id'))
      .attr('type', type);
    }
    else {
      $el = $('<textarea />');
    }

    $el.addClass(classes)
    .attr('data-coder-template', template)
    .attr('data-language', language)
    .attr('data-save', save)
    .text(content)
    .find("a")
    .attr('target','_blank')
    .end();

    $gist.after($el).remove();


    prepareSlide(slide.attr('data-slide-id'), slide);

  }


  function displayCodeSlide(slide) {
    slide.find(".coder-wrapper").each(function() {
      var $container = $(this);
      generateCodeSlide($container,slide);
      resizeEditors(slide,$container);
    });

  }


  $d.bind('deck.init',function() {

    $('.gist[data-gist-id]').each(function(idx) {
      var $gist = $(this);
      var gistId = $gist.attr('data-gist-id');

      savedGistData[gistId] = savedGistData[gistId] || [];
      savedGistData[gistId].push($gist);
    });

    for(var id in savedGistData){
      getGist(id);
    }


    $("a").attr('target','_blank');
    $.each($[deck]('getSlides'), prepareSlide);

    prettyPrint();
  });


  $d.bind('deck.change',function(e,from,to) {
    var last = $[deck]('getSlide',from);
    if(last) { killDestination(last);  }

    var current =$[deck]('getSlide', to);

    displayCodeSlide(current);
  });

})(jQuery,'deck',this);
