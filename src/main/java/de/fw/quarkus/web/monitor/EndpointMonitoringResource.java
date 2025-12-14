package de.svi.isi.web.monitor;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import io.smallrye.common.annotation.Blocking;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/endpoint")
public class EndpointMonitoringResource {
  private static final Logger logger = LogManager.getLogger(EndpointMonitoringResource.class);
  
  @GET
  @Path("/get/{protokoll}/{host}")
  @Blocking
  public Uni<Response> get(@PathParam("protokoll") String protokoll, @PathParam("host") String host) throws IOException, InterruptedException {
	WebUrl webUrl = new WebUrl();
    webUrl.setProtokoll(protokoll);
    webUrl.setHost(host);
    return Uni.createFrom().item(Response.ok(checkUrl(webUrl)).build()).log("curl with: " + protokoll + "://" + host);
  }
  
  private WebUrl checkUrl(WebUrl webUrl) {
    logger.info("start to check: {} ", webUrl);
    HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2).connectTimeout(Duration.ofSeconds(10)).build();
    
    HttpRequest httpRequest = HttpRequest.newBuilder().GET().uri(URI.create(webUrl.getProtokoll() + "://" + webUrl.getHost())).build();
    
    HttpResponse<String> httpResponse;
    
    try {
      httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
      logger.info("httpResponse.statusCode(): {} ", httpResponse.statusCode());
      
      logger.info("httpResponse.sslSession().isEmpty(): {}", httpResponse.sslSession().isEmpty());
      
      logger.info("httpResponse.sslSession().isPresent: {}", httpResponse.sslSession().isPresent());
      
      logger.info("httpResponse.headers(): {}", httpResponse.headers().map());
      
      logger.info("httpResponse.body(): {}", httpResponse.body());
      
      webUrl.setStatus(String.valueOf(httpResponse.statusCode()));
      webUrl.setDetails(httpResponse.body());
      
    } catch (IOException | InterruptedException e) {
      webUrl.setStatus("500");
      webUrl.setDetails("IOException | InterruptedException: " + e.toString());
      logger.error("IOException | InterruptedException", e);
    }
    
    return webUrl;
  }
  
  @POST
  @Path("/get/list")
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  @Blocking
  public Uni<Response> curlList(List<WebUrl> urls) {
    logger.info("urls to check: {} ", urls);
    return Uni.createFrom().item(Response.ok(checkList(urls)).build()).log("curlList: " + urls.size());
  }
  
  private List<WebUrl> checkList(List<WebUrl> urls) {
    List<WebUrl> checkedUrls = new ArrayList<>();
    for (WebUrl w : urls) {
      checkedUrls.add(checkUrl(w));
    }
    return checkedUrls;
  }
  
}
