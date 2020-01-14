//https://www.instagram.com/sixwood_dessert/?__a=1

fb = [];
finial_total = 0;
const monthString = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

window.fbAsyncInit = function() {
  FB.init({
    appId            : '2109353125843877',
    autoLogAppEvents : true,
    xfbml            : true,
    version          : 'v5.0'
  });
  //callFBLogin();
};
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function callFBLogin() {
  $(".load-box").fadeIn();
  FB.getLoginStatus(function(response) {
    if (response.authResponse) {
      FB.api('/me',{fields: 'id,name,email,picture'}, function (response) {
        fb = response;
        $(".call-fb").hide();
        $(".fb-need-login").remove();
        $(".fb-is-login").show();
        //$(".fb-name").text(response.name).show();
        $(".order-list").show();
        $(".fb-name").css("background-image", "url('"+ response.picture.data.url +"')").addClass("show")
        apiCreateMember(fb.id);
        apiReadOrderlist(fb.id);
        apiReadEcartlist(fb.id);
      });
    } else {
      FB.login(function (response) {
        if (response.authResponse) {
          FB.api('/me',{fields: 'id,name,email,picture'}, function (response) {
            fb = response;
            $(".call-fb").hide();
            $(".fb-need-login").remove();
            $(".fb-is-login").show();
            $(".order-list").show();
            $(".fb-name").css("background-image", "url('"+ response.picture.data.url +"')").addClass("show")

            apiCreateMember(fb.id);
            apiReadOrderlist(fb.id);
            apiReadEcartlist(fb.id);
          });
        }
      }, { scope: 'email' });
    }
  });
}

  //get product list
  axios.get('api/product/', {params: {action: 'list'}})
  .then(function (response) {
    var data = response.data;
    for(var i in data) {
      var dat = data[i];
      var clone = $(".clone-productbox-item .item").clone();
        clone.attr("data-uuid", dat['uuid']);
        clone.find(".img").addClass("lazyload").attr("data-background", dat['imglist'][0]);
        clone.find(".title").text(dat['title']);
        clone.find(".price").text("NT$" + dat['price']);
        clone.find(".subtitle").text(dat['subtitle']);
      $(".productbox").append(clone)
    }
    $(".lazyload").lazyload();
  })
  .catch(function (error) {
    console.log(error);
  });
function onImageLoaded(url, cb) {
    var image = new Image()
    image.src = url
  
    if (image.complete) {
      cb(image)
    } else {
      image.onload = function () {
        cb(image)
      }
    }
  }
function apiCreateMember(fbid) {
  axios.post('api/member/', {params: {
    action: 'insert-member', 
    fbid: fbid,
    ecartInfo: sessionStorage
  }})
  .then(function (response) {
    localStorage.setItem("fbid", fb.id);
    localStorage.setItem("jwt", response.data.jwt);
  })
  .catch(function (error) {
    console.log(error);
  });
}  
function apiReadEcartlist(fbid) {
  var counter = 0, finial_total = 0;
  axios.post('api/member/', {params: {
    action: 'get-ecartlist', 
    fbid: fbid
  }})
  .then(function (response) {
    if (response.data.status) {
      sessionStorage.setItem("ecart-length", response.data.data.length);
      call_shopcount();
      for(var i in response.data.data) {
        var dat = response.data.data[i];
        var clone = ta.find(".clone-ecart-itembox .item").clone();
        clone.find(".img").css("background-image", "url("+ dat['imgurl'] +")");
        if (dat['itemidx'].length == 0)
          clone.find(".name").html(dat['title'] + dat['subtitle']);
        else
          clone.find(".name").html(dat['title'] + dat['subtitle'] + " - <span>" + dat['itemtxt'] + "</span>");
        clone.find(".fa-trash-alt, .count a").attr("data-timestamp", dat['timestamp']);
        clone.find(".price span").text( formatNumber(dat['count'] * dat['price']));
        clone.find(".count-price input").val( dat['count']);
        clone.find(".ecart-minus, .ecart-plus").attr("data-price", dat['price']);
        finial_total = finial_total + (dat['count'] * dat['price']);
        counter+=dat['count'];
        ta.find(".itembox").append(clone);
      }
      var get_shipping_price = func_shipping(counter, finial_total);
      ta.find(".freight-price").text(formatNumber(get_shipping_price));

      finial_total+=get_shipping_price;
      ta.find(".finial-total").text(formatNumber(finial_total));
    }
  })
  .then(function() {
    $(".load-box").fadeOut();
  })
  .catch(function (error) {
    console.log(error);
  });
}  
function apiReadOrderlist(fbid) {
  axios.post('api/member/', {params: {
    action: 'get-orderlist', 
    fbid: fbid
  }})
  .then(function (response) {
    if (response.data.status) {
      $(".orderlist .order-none").hide();
      var ta = $(".orderlist .order-target");
      for(var i in response.data.data) {
        var dat = response.data.data[i];
        var tmp = "";
        var clone = $(".clone-orderlist-item .order-item").clone();
          clone.find(".sn span").text(dat['pid']);
          clone.find(".package span").text(dat['package'])

        for(var j in dat['ordergroup']) {
          var val = dat['ordergroup'][j];
          var clone_child = $(".clone-orderlist-listitem .list").clone();
            clone_child.find(".img img").attr("src", val['imgurl']);
            clone_child.find(".counter .price span").text(val['price']);
            clone_child.find(".counter .count span").text(val['count']);
            clone_child.find(".info .title").text(val['name']);
            clone_child.find(".info .subtitle").text(val['title']);
            if (val['subtitle'] != "null")
              clone_child.find(".info .item").text(val['subtitle']);
            else
              clone_child.find(".info .item").hide();
          clone.find(".list-target").append(clone_child);
        }

        ta.append(clone);
      }
      ta.show();
    }
  })
  .then(function() {
    $(".load-box").fadeOut();
  })
  .catch(function (error) {
    console.log(error);
  });
}  
var onReady = () => {
  call_shopcount();

  $(".ig .igbox").on("click", ".item", (e) => {
    var me = $(e.currentTarget);
    //window.location.href = o.attr("data-href");
    window.open("https://www.instagram.com/p/" + me.attr("data-href"), '_blank');
  });

  $(".product").on("click", ".item", (e) => {
    var me = $(e.currentTarget),
        uuid = me.attr("data-uuid");
    $(".load-box").fadeIn();
    window.history.pushState(uuid, 'SIXWOOD - 森林木工作室', '/?' + uuid);

    $("body").addClass("noscroll");
    
    axios.get('api/product/', {params: {action: 'detail', uuid: uuid}})
    .then(function (response) {
      var data = response.data[0],
          ta = $(".product-info");
          ta.find(".itembox").empty();

          if (data.limited_date != '0000-00-00')
            ta.find(".alert span").text("限 " + data.limited_date +" 前可訂購").show();
          else
            ta.find(".alert").hide();

          ta.find(".title").text(data.title);
          ta.find(".subtitle").text(data.subtitle);
          ta.find(".imgbox .imgmain .img").addClass("lazyload").attr("data-background", data.imglist[0]);
          ta.find(".detail-info .desc").html(nl2br(data.desc));
          ta.find(".price").text(formatNumber(data.price)).attr("data-price", data.price);
          ta.find(".pricebox a").attr({"data-uuid": data.uuid, "data-imgurl": data.imglist[0]});
          ta.find(".count a").attr("data-price", data.price);

          for(var i in data.imglist) {
            var dat = data.imglist[i];
            var tmp = "";
            var on_class = (i == 0)? "on": "";
            onImageLoaded(dat, function (icon) {
              tmp += '<img class="img lazyload '+ on_class +'" src="'+ dat+'" data-background="'+ dat +'">';
            })
          }
          ta.find(".imgbox .imglist").empty().append(tmp);
          if (data.group != false) {
            $(".product-info .ecartlist, .product-info .itembox").show();
            $(".product-info .product-infobox").removeClass("height-auto");
            $(".product-info .pricebox a").attr("data-chooese", false);
            for(var i in data.group) {
              var dat = data.group[i];
              var tmp = "";
              var clone = ta.find(".clone-product-itembox .item").clone();
                clone.find(".item_type").text(dat['item_type']);

              for(var j in dat['info']) {
                var val = dat['info'][j];
                tmp += "<li data-itemidx='"+ val['idx'] +"'>"+ val['title'] +"</li>";
              }
              clone.find("ul").html(tmp);
              //console.log(clone);
              ta.find(".itembox").append(clone);
            }
          } else {
            $(".product-info .ecartlist, .product-info .itembox").hide();
            $(".product-info .product-infobox").addClass("height-auto");
            $(".product-info .pricebox a").attr("data-chooese", true);
            console.warn("data.group");
          }
    })
    .then(function() {
      $(".lazyload").lazyload();
      $(".product-info").show();
      $(".load-box").fadeOut();
    })
    .catch(function (error) {
      console.log(error);
    });
  });

  $(".order-list").on("click", (e) => {
    if (!$(".orderlist").is(':visible')) {
      $(".orderlist").slideDown();
      $('html,body').animate({ scrollTop: 0 }, 'slow'); 
    } else {
      $(".orderlist").slideUp();
    }
  });

  $(".product-info").on("click", ".item", (e) => {
    var me = $(e.currentTarget),
        hasClass = me.hasClass("slided");

        if (!hasClass) {
          $(".product-info .item").removeClass("slided").find(".chooese").slideUp();
          me.addClass("slided").find(".chooese").slideDown();
        }
  });

  $(".product-info").on("click", ".chooese li", (e) => {
    var me = $(e.currentTarget),
        txt = me.text(),
        item_idx = me.attr("data-itemidx"),
        item_txt = me.text(),
        target = me.parent().parent().prev().find("span.client-chooese");

        target.text(txt).removeClass("unchooese");



        setTimeout(function() {
          me.parent().parent().parent().parent().removeClass("slided").find(".chooese").slideUp().attr({"data-itemidx": item_idx, "data-itemtxt": item_txt});
          me.parent().parent().parent().parent().parent().parent().parent().find(".pricebox a").attr("data-chooese", true);
        }, 100);
  });


  $(".product-plus").on("click", (e) => {
    var me = $(e.currentTarget),
        price = me.attr("data-price"),
        parent = me.parent(".count"),
        val = parent.find("input").val(),
        ta_total = parent.parent().parent().find(".pricebox span.price");

        val++;
    parent.find("input").val(val);

    ta_total.text(formatNumber(val * price)).attr("data-total", (val * price));
  });

  $(".ecart").on("click", ".ecart-plus", (e) => {
    var me = $(e.currentTarget),
        min = me.attr("data-min"),
        price = me.attr("data-price"),
        timestamp = me.attr("data-timestamp"),
        parent = me.parent(".count"),
        val = parent.find("input").val(),
        ta_total = parent.next().find("span"),
        counter = 0;



    if (val <= min) {return;}
        val++;
    parent.find("input").val(val);
    ta_total.text(formatNumber(val * price)).attr("data-total", val * price);

    var existing = sessionStorage.getItem('data-' + timestamp);
    existing = existing ? JSON.parse(existing) : {};
    existing['count'] = val;
    sessionStorage.setItem('data-' + timestamp, JSON.stringify(existing));

    $(".itembox .counter").each(function() {
      counter+=parseInt($(this).val());
    });

    var get_shipping_price = func_shipping(counter, (finial_total + parseInt(price)));
    finial_total = finial_total + parseInt(price) + get_shipping_price;

    $(".ecart .finial-total").text(formatNumber(finial_total));
    $(".ecart .freight-price").text(formatNumber(get_shipping_price));
    if (localStorage.getItem("jwt")) {
      axios.post('api/member/', {params: {
        action: 'modify-ecart', 
        timestamp: timestamp,
        count: val,
        fbid: localStorage.getItem("fbid")
      }})
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {

    }
  });


  $(".product-minus").on("click", (e) => {
    var me = $(e.currentTarget),
        min = me.attr("data-min"),
        price = me.attr("data-price"),
        parent = me.parent(".count"),
        val = parent.find("input").val(),
        target = me.parent().parent().prev().find("span.client-chooese"),
        ta_total = parent.parent().parent().find(".pricebox span.price");


    if (val <= min) {return;}
        val--;
    parent.find("input").val(val);

    ta_total.text(formatNumber(val * price)).attr("data-total", (val * price));
  });

  $(".ecart").on("click", ".ecart-minus", (e) => {
    var me = $(e.currentTarget),
        min = me.attr("data-min"),
        price = me.attr("data-price"),
        timestamp = me.attr("data-timestamp"),
        parent = me.parent(".count"),
        val = parent.find("input").val(),
        target = me.parent().parent().prev().find("span.client-chooese"),
        ta_total = parent.next().find("span"),
        counter = 0;


    if (val <= min) {return;}
        val--;
    parent.find("input").val(val);
    
    ta_total.text(formatNumber(val * price)).attr("data-total", val * price);

    var existing = sessionStorage.getItem('data-' + timestamp);
    existing = existing ? JSON.parse(existing) : {};
    existing['count'] = val;
    sessionStorage.setItem('data-' + timestamp, JSON.stringify(existing));


    $(".itembox .counter").each(function() {
      counter+=parseInt($(this).val());
    });

    var get_shipping_price = func_shipping(counter, (finial_total - price) );

    finial_total = (finial_total - price) + get_shipping_price;
    $(".ecart .finial-total").text(formatNumber(finial_total));
    $(".ecart .freight-price").text(formatNumber(get_shipping_price));
    if (localStorage.getItem("jwt")) {
      axios.post('api/member/', {params: {
        action: 'modify-ecart', 
        timestamp: timestamp,
        count: val,
        fbid: localStorage.getItem("fbid")
      }})
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {

    }
  });

  $(".ecart").on("click", ".fa-trash-alt", (e) => {
    var me = $(e.currentTarget),
        val = me.parent().find("input").val(),
        timestamp = me.attr("data-timestamp"),
        price = me.parent().find("a.ecart-plus").attr("data-price");
    
    if (localStorage.getItem("jwt")) {
      axios.post('api/member/', {params: {
        action: 'delete-ecart', 
        timestamp: timestamp,
        fbid: localStorage.getItem("fbid")
      }})
      .then(function (response) {
        me.parent().remove();

        var data_length = parseInt(sessionStorage.getItem("ecart-length"));
        data_length = (!data_length)? 0 : data_length;
        sessionStorage.setItem("ecart-length", data_length - 1);
        call_shopcount();

        finial_total = finial_total - (val * price);
        $(".ecart .finial-total").text(formatNumber(finial_total));
      })
      .catch(function (error) {
        console.log(error);
      });
      
    } else {
      me.parent().remove();
      localStorage.removeItem("data-" + timestamp);

      var data_length = parseInt(sessionStorage.getItem("ecart-length"));
      data_length = (!data_length)? 0 : data_length;
      sessionStorage.setItem("ecart-length", data_length - 1);
      call_shopcount();

      finial_total = finial_total - (val * price);
      $(".ecart .finial-total").text(formatNumber(finial_total));

    }
  });

  $(".ecartbox .header .fa-times, .privacy .fa-times, .product-info .fa-times").on("click", () => {
    call_closebox();
  });
  
  
  $(".pricebox").on("click", "a", (e) => {
    e.preventDefault();
    var me = $(e.currentTarget),
        chooesed = me.attr("data-chooese");

    if (chooesed == "false") {
      swal.fire(
        '您尚未選擇 組合 內容'
      )
      return;
    }
    
    var val = [],
        itemarr = [],
        itemtxtarr = [],
        chooese_status = true,
        item = $(".product-info .itembox .item");

        uuid = me.attr("data-uuid");

        item.each(function(i, val) {
          var me = $(this);
              itemidx = me.find(".chooese").attr("data-itemidx");
              itemtxt = me.find(".chooese").attr("data-itemtxt");

          if (itemidx == undefined)
            chooese_status = false
          
            itemarr.push(itemidx);
            itemtxtarr.push(itemtxt);
        })

        if (!chooese_status) {
          swal.fire(
            '您尚未選擇 組合 內容'
          )
          return;
        }
    $(".load-box").fadeIn();
    var count = $(".product-info input[name='count']").val();
    var imgurl = $(".product-info .pricebox a").attr("data-imgurl");
    var price = $(".product-info .pricebox .price").attr("data-price");
    var title = $(".product-info .textbox .title").text();
    var subtitle = $(".product-info .textbox .subtitle").text();
    //console.log(val, itemarr, count);
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);

    if (localStorage.getItem("jwt")) {
      //寫入db
      axios.post('api/member/', {params: {
        action: 'create-ecartlist', 
        fbid: localStorage.getItem("fbid"),
        uuid: uuid, 
        itemidx: itemarr.join(),
        itemtxt: itemtxtarr.join(),
        title: title,
        subtitle: subtitle,
        count: count,
        price: price,
        imgurl: imgurl,
        timestamp: timestamp
      }})
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {
      sessionStorage.setItem("data-" + timestamp, JSON.stringify({
        uuid: uuid, 
        itemidx: itemarr.join(),
        itemtxt: itemtxtarr.join(),
        title: title,
        subtitle: subtitle,
        count: count,
        price: price,
        imgurl: imgurl,
        timestamp: timestamp
      }));
      var data_length = parseInt(sessionStorage.getItem("ecart-length"));
      data_length = (!data_length)? 0 : data_length;
      sessionStorage.setItem("ecart-length", data_length + 1);
    }
    call_closebox();
    call_ecart();
    $(".load-box").fadeOut();

  });

  $(".pay-finish").on("click", (e) => {
    e.preventDefault();
    if ((sessionStorage.length <= 0) || (sessionStorage.getItem("address-info") == null)) {
      Swal.fire({
        icon: 'error',
        title: '購物車資料不完整',
        text: '宅配收貨地址 或 購物車裡沒有物品 :(',
      })
    } else {
      Swal.fire({
        title: '確認購物車資料',
        text: "請確認購物車資料是否完整？",
        showCancelButton: true,
        confirmButtonColor: '#6787a5',
        cancelButtonColor: '#e60023',
        confirmButtonText: '繼續購物',
        cancelButtonText: '前完線上信用卡支付'
      }).then((result) => {
        //$(".load-box").fadeIn();
        if (!result.value) {
          axios.post('api/member/', {params: {
            action: 'insert-ecart', 
            addressInfo: JSON.parse(sessionStorage.getItem("address-info")),
            packageDay: sessionStorage.getItem("package-timestamp-text"),
            packageTime: sessionStorage.getItem("package-radiobox-text"),
            ecartInfo: sessionStorage,
            fbid: localStorage.getItem("fbid")
          }})
          .then(function (response) {
            //console.log(response.data.sn);
            $("input[name='SixSn']").attr("value", response.data.sn);
          })
          .then(function (response) {
            $("form#idFormAioCheckOut").submit();
          })
          .catch(function (error) {
            console.log(error);
          });
        }
      })
    }
  });

  $(".call-privacy").on("click", (e) => {
    e.preventDefault();
    $("body").addClass("noscroll");
    $(".privacy").show();
  });

  $(".call-terms").on("click", (e) => {
    e.preventDefault();
    $("body").addClass("noscroll");
    $(".terms").show();
  });

  $(".ecart").on("click", ".address", (e) => {
    e.preventDefault();
    $("body").addClass("noscroll");
    var input = JSON.parse(sessionStorage.getItem("address-info"));
    if (input) {
      $("input[name='country']").val(input.country);
      $("input[name='city']").val(input.city);
      $("input[name='full_address']").val(input.full_address);
      $("input[name='person']").val(input.person);
      $("input[name='person_phone']").val(input.person_phone);
    }
    $(".address-lightbox").show();
  });

  $(".ecart").on("click", ".inout", (e) => {
    e.preventDefault();
    $("body").addClass("noscroll");
    $(".inout-lightbox").show();
  });

  $(".section").on("click", ".fb-name", (e) => {
    e.preventDefault();
    $("body").addClass("noscroll");
    var input = JSON.parse(sessionStorage.getItem("member-info"));
    if (input) {
      $("input[name='country']").val(input.country);
      $("input[name='city']").val(input.city);
      $("input[name='full_address']").val(input.full_address);
      $("input[name='name']").val(input.name);
      $("input[name='phone']").val(input.phone);
      $("input[name='birthday']").val(input.birthday);
      $("input[name='sex']").eq(input.sex).attr("checked", true);
    }
    $(".person-lightbox").show();
  });
  

  $(".ecart").on("click", ".day-item", (e) => {
    e.preventDefault();
    $("body").addClass("noscroll");

    var me = $(e.currentTarget);
    me.addClass("selected").siblings().removeClass("selected");
    
    sessionStorage.setItem("package-timestamp", me.data("timestamp"));
    sessionStorage.setItem("package-timestamp-text", me.data("daytime"));
    setSendPackageDay();

  });

  $(".check-person").on("click", (e) => {
    e.preventDefault();
    var form = $(".person-info .input-field"),
        temp = {},
        canSend = true;

    form.each(function() {
      var me = $(this),
          val = me.val();

      if (val.length <= 0) {
        canSend = false;
        me.parent().addClass("error");
      } else {
        temp[me.attr("name")] = val;
      }
    })
    if (canSend) {
      Swal.fire({
        title: '設定個人資訊',
        text: "請確認個人資訊是否正確，確認離開？",
        showCancelButton: true,
        confirmButtonColor: '#6787a5',
        cancelButtonColor: '#e60023',
        confirmButtonText: '繼續編輯',
        cancelButtonText: '確認資料'
      }).then((result) => {
        if (!result.value) {
          $(".person-lightbox").hide();
          sessionStorage.setItem("member-info", JSON.stringify(temp));
        }
      })
    }
  });

  $(".check-address").on("click", (e) => {
    e.preventDefault();
    var form = $(".address-info .input-field"),
        temp = {},
        canSend = true;

    form.each(function() {
      var me = $(this),
          val = me.val();

      if (val.length <= 0) {
        canSend = false;
        me.parent().addClass("error");
      } else {
        temp[me.attr("name")] = val;
      }
    })
    if (canSend) {
      Swal.fire({
        title: '宅配收貨資訊',
        text: "請確認宅配收貨資訊是否正確，確認離開？",
        showCancelButton: true,
        confirmButtonColor: '#6787a5',
        cancelButtonColor: '#e60023',
        confirmButtonText: '繼續編輯',
        cancelButtonText: '確認資料'
      }).then((result) => {
        $(".load-box").fadeIn();
        if (!result.value) {
          $(".address-lightbox").hide();
          sessionStorage.setItem("address-info", JSON.stringify(temp));
          check_addressinfo();
          $(".load-box").fadeOut();
        }
      })
    }
  });

  $("input.input-field").on("keyup", (e) => {
    var me = $(e.currentTarget);

    me.parent().removeClass("error");

  })

  $(".check-daytime").on("click", (e) => {
    e.preventDefault();
    var selected = $(".inout-lightbox-dayarea .day-item.selected").length;

    if (selected <= 0) {
      Swal.fire({
        title: '宅配到貨時間',
        text: "您尚未選擇宅配到貨時間，確認離開？",
        showCancelButton: true,
        confirmButtonColor: '#6787a5',
        cancelButtonColor: '#e60023',
        confirmButtonText: '繼續選擇',
        cancelButtonText: '離開'
      }).then((result) => {
        $(".load-box").fadeIn();
        if (!result.value) {
          $(".inout-lightbox").hide();
          $(".load-box").fadeOut();
        }
      })
    } else {
      Swal.fire({
        title: '宅配到貨時間',
        text: "實際配達時間以宅急便當日配送為主。",
        showCancelButton: true,
        confirmButtonColor: '#6787a5',
        cancelButtonColor: '#e60023',
        confirmButtonText: '確認',
        cancelButtonText: '調整時間'
      }).then((result) => {
        $(".load-box").fadeIn();
        if (result.value) {
          setSendPackageDay();
          $(".inout-lightbox").hide();
        }
        $(".load-box").fadeOut();
      })
    }
  });

  $(".fa-shopping-basket").on("click", (e) => {
    e.preventDefault();
    var me = $(e.currentTarget),
        count = parseInt(me.parent().find("span").text());

    if (count === 0) {return;}
    
    call_ecart();
    getWeek();
    setSendPackageDay();
  });

  $(".inout-lightbox").on("click", "i.fas", () => {
    $(".inout-lightbox").hide();
  });

  $(".address-lightbox").on("click", "i.fas", () => {
    $(".address-lightbox").hide();
  });

  $(".person-lightbox").on("click", "i.fas", () => {
    $("body").removeClass("noscroll");
    $(".person-lightbox").hide();
  });

  $("input[name='awesome-radiobox']").on("click", (e) => {
    var me = $(e.currentTarget),
        eq = (me.index() <= 0)? 0: me.index() / 2;
    sessionStorage.setItem("package-radiobox", eq);
    sessionStorage.setItem("package-radiobox-text", me.val());
  });
  
}

$(document).ready(onReady);

function nl2br( str ) {
  return str.replace(/([^>])\n/g, '$1<br/>\n');
} 

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function setSendPackageDay() {
  if (sessionStorage.getItem("package-timestamp")) {
    $(".ecart .inout .infobox .time span:first-child").text(sessionStorage.getItem("package-timestamp-text"));
    $(".ecart .inout .infobox .time span:last-child").text(sessionStorage.getItem("package-radiobox-text"));
    $("input[name='awesome-radiobox']").eq(sessionStorage.getItem("package-radiobox")).attr("checked", true);
    $(".ecart .inout-lightbox .inout-lightbox-dayarea .timestamp-" + sessionStorage.getItem("package-timestamp")).addClass("selected");
  } else {
    $(".ecart .inout-lightbox-dayarea .day-item:first-child").click();
    $(".ecart .inout-lightbox-timearea input[name='awesome-radiobox']").eq(0).click();
  }
}

function call_closebox() {
  $("body").removeClass("noscroll");
  $(".ecart, .privacy, .terms, .product-info").hide();
  $(".pricebox a").attr("data-chooese", false);
  $(".product-info input[name='count']").val(1);

  window.history.pushState('/', 'SIXWOOD - 森林木工作室', '/');
}

function func_shipping(n, total) {
  if (total <= 5000) {
    if (n <= 5)
      return 170
    else if (n <= 10)
      return 250
    else if (n <= 15)
      return 500
  } else {
    return 0;
  }
}

function call_shopcount() {
  var len = (sessionStorage.getItem("ecart-length") === null)? 0: sessionStorage.getItem("ecart-length");
  $(".shop span, .subtitle span").text(len);
}
function call_ecart() {
  var i = 0,
      ta = $(".ecart");
  
  finial_total = 0;
  counter = 0;
  
  ta.find(".itembox").empty();
  
  $("body").addClass("noscroll");
  
  check_addressinfo();
  if (localStorage.getItem("jwt")) {
    axios.post('api/member/', {params: {
      action: 'get-ecartlist', 
      fbid: localStorage.getItem("fbid")
    }})
    .then(function (response) {
      if (response.data.status) {
        sessionStorage.setItem("ecart-length", response.data.data.length);
        call_shopcount();
        for(var i in response.data.data) {
          var dat = response.data.data[i];
          var clone = ta.find(".clone-ecart-itembox .item").clone();
          clone.find(".img").css("background-image", "url("+ dat['imgurl'] +")");
          if (dat['itemidx'].length == 0)
            clone.find(".name").html(dat['title'] + dat['subtitle']);
          else
            clone.find(".name").html(dat['title'] + dat['subtitle'] + " - <span>" + dat['itemtxt'] + "</span>");
          clone.find(".fa-trash-alt, .count a").attr("data-timestamp", dat['timestamp']);
          clone.find(".price span").text( formatNumber(dat['count'] * dat['price']));
          clone.find(".count-price input").val( dat['count']);
          clone.find(".ecart-minus, .ecart-plus").attr("data-price", dat['price']);
          finial_total = finial_total + (dat['count'] * dat['price']);
          counter+=dat['count'];
          ta.find(".itembox").append(clone);
        }
        var get_shipping_price = func_shipping(counter, finial_total);
        ta.find(".freight-price").text(formatNumber(get_shipping_price));

        finial_total+=get_shipping_price;
        ta.find(".finial-total").text(formatNumber(finial_total));
      }
    })
    .then(function() {
      $(".load-box").fadeOut();
    })
    .catch(function (error) {
      console.log(error);
    });
  } else {
    for(var key in sessionStorage) {
      if (key.indexOf("data-") != -1) {
        var dat = JSON.parse(sessionStorage.getItem(key));
        var clone = ta.find(".clone-ecart-itembox .item").clone();
        clone.find(".img").css("background-image", "url("+ dat.imgurl +")");
        if (dat.itemidx.length == 0)
          clone.find(".name").html(dat.title + dat.subtitle);
        else
          clone.find(".name").html(dat.title + dat.subtitle + " - <span>" + dat.itemtxt + "</span>");
        clone.find(".fa-trash-alt, .count a").attr("data-timestamp", dat.timestamp);
        clone.find(".price span").text( formatNumber(dat.count * dat.price));
        clone.find(".count-price input").val( dat.count);
        clone.find(".ecart-minus, .ecart-plus").attr("data-price", dat.price);
        counter+=parseInt(dat.count);
        finial_total = finial_total + (dat.count * dat.price);
        ta.find(".itembox").append(clone);
      }
    }
    console.log(counter, finial_total);
    var get_shipping_price = func_shipping(counter, finial_total);
    ta.find(".freight-price").text(formatNumber(get_shipping_price));
    finial_total+=get_shipping_price;
    ta.find(".finial-total").text(formatNumber(finial_total));
    call_shopcount();
  }
  
  
  $(".ecart").show();
}
function check_addressinfo() {
  var addressInfo = JSON.parse(sessionStorage.getItem("address-info"));
  if (addressInfo) {
    $(".address-init").hide()
    var ta = $(".address-hasdata");
    ta.find(".country").text(addressInfo.country);
    ta.find(".city").text(addressInfo.city);
    ta.find(".full-address").text(addressInfo.full_address);
    ta.find(".person").text(addressInfo.person);
    ta.find(".person_phone").text(", " + addressInfo.person_phone);
    ta.show();
  }
}
function getWeek() {
  var ta = $(".inout-lightbox-dayarea");
  const week = [];
  const week_str = ['二', '三', '四', '五', '六'];
  var counter = 1;
  ta.empty();


  for (let i = 4; i < 40; i++) {
    var clone = $(".clone-lightbox-day-item .day-item").clone();
    
    let Stamp = new Date();
    let num = 7 - Stamp.getDay() + 1 + i;
    let remainder = i % 7;
    Stamp.setDate(Stamp.getDate() + num);
    let dateTime = +new Date(Stamp.getFullYear() +"/"+(Stamp.getMonth() + 1)+"/"+Stamp.getDate());
    if (remainder != 0 && remainder != 6 && counter <= 20) {
      counter++;
      clone.attr({
        "data-daytime": Stamp.getFullYear() + "年" + (Stamp.getMonth() + 1) + "月" + Stamp.getDate() +"日 週" + week_str[remainder - 1] +" ",
        "data-timestamp": dateTime
      }).addClass("timestamp-" + dateTime);
      clone.find(".year").html(Stamp.getFullYear());
      clone.find(".week").html("(" + week_str[remainder - 1] + ")");
      clone.find(".day").html(Stamp.getDate());
      clone.find(".mon").html(monthString[Stamp.getMonth()]);
      ta.append(clone);
      /*
      week.push({
        "y": Stamp.getFullYear(),
        "m": monthString[Stamp.getMonth()],
        "d": Stamp.getDate(),
        "w": week_str[remainder - 1]
      });
      */
    }
  }
  return week;
}
