import binascii
import codecs
import email.header
import quopri

def get_part_content(part):
    try:
        content = quopri.decodestring(part.get_payload())
        if part.get_content_charset() != None and part.get_content_charset() != "":
            content = content.decode(part.get_content_charset()).encode("utf8")
        return content
    except:
        try:
            content = part.get_payload()
            if part.get_content_charset() != None and part.get_content_charset() != "":
                content = content.decode(part.get_content_charset()).encode("utf8")
            return content
        except:
            return part.get_payload()

def mime_decode(mime_):
    mime = mime_.replace("\r", "")
    result = ""
    if mime != None and mime != "":
        aux = email.header.decode_header(mime)
        for i in range(len(aux)):
            if aux[i][1] != None:
                result = result + aux[i][0].decode(aux[i][1]).encode("utf8")
            else:
                result = result + aux[i][0].encode("utf8")
    return result

# encoding

def modified_base64(s):
    s = s.encode('utf-16be')
    return binascii.b2a_base64(s).rstrip('\n=').replace('/', ',')

def doB64(_in, r):
    if _in:
        r.append('&%s-' % modified_base64(''.join(_in)))
        del _in[:]

def encoder(s):
    r = []
    _in = []
    for c in s:
        ordC = ord(c)
        if 0x20 <= ordC <= 0x25 or 0x27 <= ordC <= 0x7e:
            doB64(_in, r)
            r.append(c)
        elif c == '&':
            doB64(_in, r)
            r.append('&-')
        else:
            _in.append(c)
    doB64(_in, r)
    return (str(''.join(r)), len(s))


# decoding

def modified_unbase64(s):
    b = binascii.a2b_base64(s.replace(',', '/') + '===')
    return unicode(b, 'utf-16be')


def decoder(s):
    r = []
    decode = []
    for c in s:
        if c == '&' and not decode:
            decode.append('&')
        elif c == '-' and decode:
            if len(decode) == 1:
                r.append('&')
            else:
                r.append(modified_unbase64(''.join(decode[1:])))
            decode = []
        elif decode:
            decode.append(c)
        else:
            r.append(c)
    if decode:
        r.append(modified_unbase64(''.join(decode[1:])))
    bin_str = ''.join(r)
    return (bin_str, len(s))


class StreamReader(codecs.StreamReader):
    def decode(self, s, errors='strict'):
        return decoder(s)


class StreamWriter(codecs.StreamWriter):
    def decode(self, s, errors='strict'):
        return encoder(s)


def imap4_utf_7(name):
    if name == 'imap4-utf-7':
        return (encoder, decoder, StreamReader, StreamWriter)
codecs.register(imap4_utf_7)


## testing methods

def imapUTF7Encode(ust):
    "Returns imap utf-7 encoded version of string"
    return ust.encode('imap4-utf-7')

def imapUTF7EncodeSequence(seq):
    "Returns imap utf-7 encoded version of strings in sequence"
    return [imapUTF7Encode(itm) for itm in seq]


def imapUTF7Decode(st):
    "Returns utf7 encoded version of imap utf-7 string"
    return st.decode('imap4-utf-7')

def imapUTF7DecodeSequence(seq):
    "Returns utf7 encoded version of imap utf-7 strings in sequence"
    return [imapUTF7Decode(itm) for itm in seq]


def utf8Decode(st):
    "Returns utf7 encoded version of imap utf-7 string"
    return st.decode('utf-8')


def utf7SequenceToUTF8(seq):
    "Returns utf7 encoded version of imap utf-7 strings in sequence"
    return [itm.decode('imap4-utf-7').encode('utf-8') for itm in seq]

