PhoneGap Suggestion (Autocomplete) Entry 
=========================
 

## Initialization

It's quite easy - when we have text-input like this:


    <input data-role="none" id="mailAddrInputField"  type="text"></input>


..and table with suggestions database: 

    var mySuggestionsArray = [ "atestmail1@git.com", "anothertestmail@zzz.net", "testowymail@zuzu.pl", "testemail666@git.com", "testpurposeemail@wp.pl", "zzztest@wp.pl"];

then we have only to call '.mobileSuggHelper' method on text-input object: 

    $('#mailAddrInputField').mobileSuggHelper(mySuggestionsArray);

and that is all what you have do. 

 
*Note: to 'darkening background' effect proper behaviour setting 'z-index' of input is needed. it's value has to be equal or larget than '2' - otherwise input field will be under dark div and this doesn't look very good:) Plugin will also log errors to javascript console about that.*

Sample CSS for input field:

    input#mailAddrInputField { 
        position: relative; 
        z-index: 2; 
    }

*If you don't like this darkening effect, you can turn this off by using configuration options. Handling options is described in paragraph 'Configuration'*


## Configuration

 
