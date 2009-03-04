<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:template match="/">
<HTML>
<BODY>
<TABLE BORDER="2">
	<TR>
		<TH>Tel</TH>
		<TH>Email</TH>
		<TH>Name</TH>
	</TR>
	<xsl:for-each select="PEOPLE/PERSON">
	<TR>
		<TD><xsl:value-of select="TEL"/></TD>
		<TD><xsl:value-of select="EMAIL"/></TD>
		<TD><xsl:value-of select="NAME"/></TD>
	</TR>
	</xsl:for-each>
</TABLE>
</BODY>
</HTML>
</xsl:template>
</xsl:stylesheet>
