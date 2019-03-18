var Veritrans = (function() {
  var t,
    e = function() {}
  function n(t) {
    var e = t.origin || t.originalEvent.origin
    t.data &&
      t.data.status_code &&
      t.data.status_message &&
      e &&
      e.match(/https?:\/\/[\w\.]+(veritrans|midtrans)\./) &&
      Veritrans.c(t.data)
  }
  return (
    window.addEventListener
      ? window.addEventListener("message", n, !1)
      : window.attachEvent("onmessage", n),
    {
      url: "https://api.veritrans.co.id/v2/token",
      client_key: "",
      version: "2.1.3-SNAPSHOT",
      c: function(t) {
        e(t)
      },
      token: function(n, a) {
        var r, i
        ;(e = a),
          ((t = n()).callback = "Veritrans.c"),
          (t.client_key = Veritrans.client_key),
          (r =
            Veritrans.url +
            (function(t) {
              var e = "?",
                n = encodeURIComponent
              for (var a in t)
                t.hasOwnProperty(a) && (e += n(a) + "=" + n(t[a]) + "&")
              return e
            })(t)),
          ((i = document.createElement("script")).src = r),
          document.getElementsByTagName("head")[0].appendChild(i)
      },
      authenticate: function(t, n) {
        ;(e = n), n({ status_code: 200, redirect_url: t })
      }
    }
  )
})()
