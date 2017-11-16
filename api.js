
var Gmail_Filter_Api = function(jQuery) {

    this.set_gmail_params = function(userEmail) {
        var gmail_params = {}

        //Parse out Base Url
        var regex = new RegExp("https://mail.google.com/(a/(.+?)/|(mail(.+?)#))");
        var matches = document.location.href.match(regex);
        m = matches[0]
        gmail_params['GMAIL_BASE_URL'] = m.substring(0, m.length-1) + '?'

        gmail_params['USER_EMAIL'] = userEmail

        //Parse out gmail_at value
        var regex = new RegExp("GMAIL_AT=(.+?);")
        var matches = document.cookie.match(regex)
        gmail_params['GMAIL_AT'] = matches[1]
        
        //Parse out Gmail_ik value from GLOBALS
        var ik_index = get_useremail_pos(0,  gmail_params['USER_EMAIL']);
        if(ik_index == -1) {
            //TODO: handle this
            // Could not find ik 
        }
        else{
            gmail_params['GMAIL_IK'] = window.GLOBALS[ik_index -1]
        }
        this.gmail_params = gmail_params ;        
    }

    //Recursion is fun! We do not like for loops anymore
    function get_useremail_pos(index, user_email) {
        if(window.GLOBALS[index] == user_email) {
           return index; 
        }
        if(index >= (window.GLOBALS.length - 1) )//Failsafe
        {
            return -1;
        }
        else {
            return get_useremail_pos(index+1, user_email);
        }
    }

    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    this.process_gmail_filter_response = function(response, keyValues){
        pattern = ""
        if(keyValues['from'] !== undefined)
            pattern += "from:\\(" + escapeRegExp(keyValues['from']) + "\\) "

        if(keyValues['has'] !== undefined)
            pattern += keyValues['has'] + " "
         
        if(keyValues['hasnot'] !== undefined)
            pattern += "-\\{" + keyValues['hasnot'] + "\\} "

        if(pattern.length > 0){
            pattern = pattern.substring(0, pattern.length-1)
        }   

        pattern = "\"\(\\d+\)\",\"" + pattern + "\"";

        console.log(pattern);
        var regex = new RegExp(pattern)

        matches = response.match(regex)
        if(matches === undefined)
            return 0;
        return matches[1];

    };

    this.deleteGmailFilter = function(filter_id){
       baseurl = this.gmail_params.GMAIL_BASE_URL;
       urlsend = baseurl + "ik=" + this.gmail_params.GMAIL_IK + "&at=" + this.gmail_params.GMAIL_AT + "&view=up&act=df&pcd=1&mb=0&rt=c";
       postdata = "tfi=" + filter_id;

       jQuery.post(urlsend, postdata, function(data){
            var gmailresponse = data;
            console.log(data);
       });
    };

    this.createGmailFilter = function(keyValues){
       thisobj = this;
       baseurl = this.gmail_params.GMAIL_BASE_URL;
       gmail_filter_url = baseurl + "ik=" + this.gmail_params.GMAIL_IK + "&at=" + this.gmail_params.GMAIL_AT + "&view=up&act=cf&pcd=1&mb=0&rt=c"

       //GMail filter variables
       postdata = "search=cf"
       for(key in keyValues){
            switch(key){
                case "from":
                    postdata = postdata + "&cf1_from=" + keyValues[key];
                    break;
                case "has":
                    postdata = postdata + "&cf1_has=" + keyValues[key];
                    break;
                case "hasnot":
                    postdata = postdata + "&cf1_hasnot=" + keyValues[key];
                    break;
                case "markread":
                    postdata = postdata + "&cf2_ar=true";
                    break;
                case "skipinbox":
                    postdata = postdata + "&cf2_cat=true";
                    break;
                case "marknotspam":
                    postdata = postdata + "&cf2_ns=true";
                    break;
                case "labelas":
                    postdata = postdata + "&cf2_sel=" + keyValues[key];

            }
       }

       jQuery.post(gmail_filter_url, postdata, function(gmail_response){
            thisobj.filterid = thisobj.process_gmail_filter_response(gmail_response, keyValues);
       });
    };

};

