package de.fw.quarkus.web;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api")
public class DummyResource {
  
  @GET
  @Path("/info")
  @Produces(value = MediaType.TEXT_HTML)
  public String getInfo() {
    return "<h3>This is a minimal konfiguration for quarkus for serving as a web server. \r\n"
    		+ "	No Servlet/REST-Implementation needed. Just put your web-resources on it!</h3>";
  }
  
}
