<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:template match="/">
<HTML>
<BODY>
<TABLE BORDER="2">
	<TR>
		<TD>Name</TD>
		<TD>Address</TD>
		<TD>Tel</TD>
		<TD>Fax</TD>
		<TD>Email</TD>
	</TR>
	<xsl:for-each select="PEOPLE/PERSON">
	<TR>
		<TD><xsl:value-of select="NAME"/></TD>
		<TD><xsl:value-of select="ADDRESS"/></TD>
		<TD><xsl:value-of select="TEL"/></TD>
		<TD><xsl:value-of select="FAX"/></TD>
		<TD><xsl:value-of select="EMAIL"/></TD>
	</TR>
	</xsl:for-each>
</TABLE>
</BODY>
</HTML>
</xsl:template>
</xsl:stylesheet>
