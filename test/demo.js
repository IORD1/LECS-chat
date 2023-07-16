
//demo











$('#hashKey').off().on('change', function(){
  $('#dataKey').keyup();
});

$(document).ready(function() {

  const ss = {
    get: function(){
      return JSON.parse(sessionStorage.getItem('time'));
    },
    set: function(i){
      sessionStorage.setItem('time', JSON.stringify(i));
      return
    }
  }

  $.each(['public','private','sign','verify'], function(i,e){
    $('#'+ e +'Key').attr('readonly','true')
  })

  $('#signKey,#verifyKey').attr('readonly','true');
  $('#curveKey').on('change', function(){
    let crv = $(this).val()

    $.ecGen(crv, function(err, gen){
      if(err){return console.log(err)}
      $.each({'public': gen.public,'private': gen.private}, function(i,e){
        $('#'+i+ 'Key').text(JSON.stringify(e,0,2))
      })
      //console.log(gen)
      $('#dataKey').off().on('keyup', function(){

        let str = $(this),
        
        hashVal = $('#hashKey').val();
        console.log(str);
        str.ecSign(gen.private, 256, 'hex', function(err, res){
          if(err){return console.log(err)}
          $('#signKey').val(res);
          str.ecVerify(gen.public, res, 256, 'hex', function(err, res){
            if(err){return console.log(err)}

            if(res){
              $('#verifyKey').val('ecdsa test pass');
              return
            }
            $('#verifyKey').val('ecdsa test fail');
            return
          })
        })
      })
    })
   });

  $('#curveKey').change();





});


