package com.marklogic.APIs;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.marker.AbstractReadHandle;
import com.marklogic.client.DatabaseClient.ConnectionType;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.util.Properties;
import java.io.InputStream;
import java.io.FileInputStream;
import java.util.stream.Stream;

import com.fasterxml.jackson.databind.JsonNode;


public class TestCustomer {
	public static void main(String [] argv) throws IOException {

	    Properties prop = new Properties();
	    InputStream input = null;

	    input = new FileInputStream("gradle.properties");

	    prop.load(input);

	    String username = prop.getProperty("mlAppServicesUsername");
	    String password = prop.getProperty("mlAppServicesPassword");
	    String operationsEndPoint = prop.getProperty("operationsEndpoint");
	    int port = 8009;

	    StringBuilder b = new StringBuilder();
	    String line = null;

	    DatabaseClient dbClient = DatabaseClientFactory.newClient(operationsEndPoint, port, new DatabaseClientFactory.DigestAuthContext(username, password), ConnectionType.GATEWAY);


	    //Reader output = Customer.on(dbClient).customerWithChInCompanyName("Ch");
	    //BufferedReader output = new BufferedReader(Customer.on(dbClient).customerWithChInCompanyName("Ch"));
	    try {
	        BufferedReader output = new BufferedReader(Customer.on(dbClient).customerWithSalesAsTitle("Sales"));
	        while ((line = output.readLine()) != null) {
	            b.append(line+"\n\n");
		    }
		    System.out.println(b);
	        output.close();
	        //System.out.println(Customer.on(dbClient).customerDocsCount("Customer"));//output.readLine());
	    } catch (Exception e) {
	        e.printStackTrace();
	      }

	    finally{dbClient.release();}
	}
}
