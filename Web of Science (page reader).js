/*
	***** BEGIN INFORMATION BOX *****

	Copyright © 2022 Alex
	
  This file is highly customized scrape function of a translator file for Zotero.
  
  Please use at your risk!
  
  You are also welcomed to add code to parse more information from the web of science web page.

	***** END INFORMATION BLOCK *****
*/

function scrape(doc, url) {
    var elem = doc.getElementById("FullRTa-doctype-0");
    if (!elem) return;

    var item;
    if (elem.innerText.trim().toLowerCase().includes("proceedings paper"))
    {
        item = new Zotero.Item("conferencePaper");
    }else{
        item = new Zotero.Item("journalArticle");
    }

	//url
    item.url = url

	//get title
	elem = doc.getElementsByClassName("title text--large");
	var title = "";
	if (elem && elem[0]){
		title = elem[0].innerText;
	}
	item.title = title;
	
	// get JIF (add to extra field) -- add to callNumber
	elem = doc.getElementsByClassName ('borderLess-button font-size-30 link-color-text')
	if (elem && elem[0]){
		let jif = "Journal impact factor: " + elem[0].innerText;
        if (item.extra){
            item.extra += '\n' + jif;
        }else{
            item.extra = jif;
        }
        item.callNumber = elem[0].innerText;
		
	}

	//get times cited (add to extra field)
	var citation_in_ele = doc.getElementById("FullRRPTa-citationNetworkIn")
	var times_cited_text = ""
	if (typeof citation_in_ele != 'undefined'){
	var citation_count_ele = citation_in_ele.parentElement.nextElementSibling.firstElementChild.firstElementChild
		times_cited_text = citation_count_ele.innerText;
        if (item.extra){
            item.extra += '\n' + "Times cited (WOS): " + times_cited_text;
        }else{
            item.extra = "Times cited (WOS): " + times_cited_text;
        }
		
	}	
    //Research Areas (add to extra field)
    elem = doc.getElementById("CategoriesTa-subject-0");
    if (elem){
        reasearch_area = elem.innerText;

        elem2 = doc.getElementById("CategoriesTa-subject-1");
        if (elem2){
            reasearch_area += "; " + elem2.innerText;
        }
        elem3 = doc.getElementById("CategoriesTa-subject-2");
        if (elem3){
            reasearch_area += "; " + elem3.innerText;
        }
        elem4 = doc.getElementById("CategoriesTa-subject-3");
        if (elem4){
            reasearch_area += "; " + elem4.innerText;
        }
        elem5 = doc.getElementById("CategoriesTa-subject-4");
        if (elem5){
            reasearch_area += "; " + elem5.innerText;
        }

        if (item.extra){
            item.extra += '\n' + "Research Areas: " + reasearch_area;
        }else{
            item.extra = "Research Areas: " + reasearch_area;
        }
    }    

    // get author list
    elem = doc.getElementsByClassName ('authors-div')
    if (elem && elem[0]){
        author_list_string = elem[0].innerHTML.replace(/\n|<.*?>/g,'');
        author_list_string = author_list_string.replace(/(\[.*?\]) */g, '');
        author_list_string = author_list_string.replace ("By:", "")
        author_list_string = author_list_string.replace (/&nbsp/g, "")
        author_list_string = author_list_string.replace (/;;/g, ";")
        var author_list = author_list_string.split (";")            

        for (i=0;i < author_list.length; i++){
          var author_temp = author_list[i]
        
          var author_name_full = author_temp.match (/(\(.*?\)) */g)[0].replace("(", "").replace(")", "")
          var author_name_full_split = author_name_full.split (",")
          var author_name_full_first = author_name_full_split[0]
          var author_name_full_second = author_name_full_split[1]

          author = {}
          author['firstName'] = author_name_full_second
          author['lastName'] = author_name_full_first
          author['creatorType'] = 'author'
          item.creators.push(author)
        }        
    }

    //get paper info
    //Book Series
    elem = doc.getElementById("FullRTa-bookSeries-0");
    if (elem){
        item.series = elem.innerText;
    }

    //page 
    elem = doc.getElementById("FullRTa-pageNo");
    if (elem){
        item.pages = elem.innerText;
    }

    //volume 
    elem = doc.getElementById("FullRTa-volume");
    if (elem){
        item.volume = elem.innerText;
    }    

    //issue 
    elem = doc.getElementById("FullRTa-issue");
    if (elem){
        item.issue = elem.innerText;
    }        

    //DOI 
    elem = doc.getElementById("FullRTa-DOI");
    if (elem){
        item.DOI = elem.innerText;
    }

    //date
    elem = doc.getElementById("FullRTa-earlyAccess");
    if (elem){
        item.date = elem.innerText;
    }
    elem = doc.getElementById("FullRTa-pubdate");
    if (elem){
        item.date = elem.innerText;
    }        

    //get conference info
    //Conference name 
    elem = doc.getElementById("ConfTa-conference-0");
    if (elem){
        item.conferenceName = elem.innerText;
    }    
    //place
    elem = doc.getElementById("ConfTa-conf-loc-state-0-0");
    if (elem){
        item.place = elem.innerText;
    }        
    //proceedings title
    elem = doc.getElementsByClassName("journal-info-source-title margin-bottom-5");
    if (elem && elem[0]){
        item.proceedingsTitle = ZU.capitalizeTitle(elem[0].innerText.toLowerCase(), true);
    }        


    //get publication title
    elem = doc.getElementsByClassName("summary-source-title-link ng-star-inserted");
    if (elem && elem[0]){
        item.publicationTitle = ZU.capitalizeTitle(elem[0].innerText.toLowerCase(), true);
    }

    //get Abstrat
    elem = doc.getElementById("FullRTa-abstract-basic");
    if (elem){
        item.abstractNote = elem.innerText;
    }

    
    //get tags
    elem = doc.getElementById("FRkeywordsTa-keyWordsTitle")
    if (elem && elem.nextSibling){
        if (elem.nextSibling.innerText.includes("Author Keywords")){
            if (elem.nextSibling.hasChildNodes() && elem.nextSibling.childNodes.length > 2){
                for (i = 0;i < elem.nextSibling.childNodes.length; i++){
                    tag_text = elem.nextSibling.childNodes[i].innerText;
                    if (tag_text && tag_text!= "" && !tag_text.includes("Author Keywords")){
                        //console.log(tag_text);
                        tag = {}
                        tag['tag'] = tag_text;
                        item.tags.push(tag);
                    }
                    
                }
            }
        }

        if (elem.nextSibling.nextSibling && elem.nextSibling.nextSibling.innerText){
            if (elem.nextSibling.nextSibling.innerText.includes("Keywords Plus")){
                if (elem.nextSibling.nextSibling.hasChildNodes() && elem.nextSibling.nextSibling.childNodes.length > 2){
                    for (i = 0;i < elem.nextSibling.nextSibling.childNodes.length; i++){
                        tag_text = elem.nextSibling.nextSibling.childNodes[i].innerText;
                        if (tag_text && tag_text!= "" && !tag_text.includes("Keywords Plus")){
                            //console.log(tag_text.toLowerCase());
                            tag = {}
                            tag['tag'] = tag_text.toLowerCase();
                            item.tags.push(tag);
                        }
                    }
                }
            }
        }
    }else{
        console.log("error1")
    }
	item.complete();
}
